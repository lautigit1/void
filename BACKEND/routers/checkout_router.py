# En backend/routers/checkout_router.py

import mercadopago
import os
import logging
import hmac
import hashlib
import json # <-- Importar json para el manejo de errores
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, exc as SQLAlchemyExceptions

from schemas import cart_schemas
from database.database import get_db
from database.models import Orden, DetalleOrden, VarianteProducto, Producto
from services import email_service

router = APIRouter(prefix="/api/checkout", tags=["Checkout"])

# --- CONFIGURACIÓN DE LOGGING ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configura el SDK de Mercado Pago
sdk = mercadopago.SDK(os.getenv("MERCADOPAGO_TOKEN"))
MERCADOPAGO_WEBHOOK_SECRET = os.getenv("MERCADOPAGO_WEBHOOK_SECRET")

# --- URLs de la aplicación ---
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")

def verify_mercadopago_signature(request: Request, payload: bytes):
    if not MERCADOPAGO_WEBHOOK_SECRET:
        logger.warning("MERCADOPAGO_WEBHOOK_SECRET no está configurado. Omitiendo verificación.")
        return # En producción, deberías lanzar un HTTPException aquí

    signature_header = request.headers.get('x-signature')
    if not signature_header:
        raise HTTPException(status_code=400, detail="x-signature header faltante")

    try:
        parts = {p.split('=')[0]: p.split('=')[1] for p in signature_header.split(',')}
        ts = parts.get('ts')
        v1 = parts.get('v1')

        if not ts or not v1:
            raise HTTPException(status_code=400, detail="Firma inválida.")

        # Reconstruimos el manifest
        data_id = request.query_params.get('data.id')
        if not data_id:
             # Si data.id no está en los query params, podría estar en el body (depende de la config de MP)
             # Esta es una implementación básica, ajustar según la notificación de MP
            data_id = json.loads(payload).get('data', {}).get('id')

        manifest = f"id:{data_id};request-id:{request.headers.get('x-request-id')};ts:{ts};"
        
        expected_signature = hmac.new(
            MERCADOPAGO_WEBHOOK_SECRET.encode(),
            msg=manifest.encode(),
            digestmod=hashlib.sha256
        ).hexdigest()

        if not hmac.compare_digest(expected_signature, v1):
            raise HTTPException(status_code=400, detail="Firma inválida.")
        logger.info("Firma de MercadoPago verificada exitosamente.")
    except Exception as e:
        logger.error(f"Error al verificar la firma de Mercado Pago: {e}")
        raise HTTPException(status_code=400, detail="Firma inválida.")

@router.post("/create_preference")
async def create_preference(cart: cart_schemas.Cart, db: AsyncSession = Depends(get_db)):
    
    # --- ROBUSTEZ: Verificación de precios y stock desde la DB ---
    items = []
    for item_in_cart in cart.items:
        # Buscamos la variante en nuestra DB
        variante_db = await db.get(VarianteProducto, item_in_cart.variante_id, options=[db.joinedload(VarianteProducto.producto)])
        
        if not variante_db:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, 
                                detail=f"Item con id {item_in_cart.variante_id} no encontrado.")
        
        # Verificamos stock
        if variante_db.cantidad_en_stock < item_in_cart.quantity:
             raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, 
                                detail=f"Stock insuficiente para {variante_db.producto.nombre}.")

        # Usamos el precio y nombre de NUESTRA DB, no el del frontend
        items.append({
            "id": variante_db.id,
            "title": variante_db.producto.nombre, # Usamos el nombre de la DB
            "quantity": item_in_cart.quantity,
            "unit_price": float(variante_db.producto.precio), # Usamos el precio de la DB
            "currency_id": "ARS"
        })

    # --- ROBUSTEZ: Usar un identificador de carrito/usuario fiable ---
    external_reference = cart.user_id or cart.guest_session_id
    if not external_reference:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, 
                            detail="El carrito debe tener un user_id o guest_session_id.")

    preference_data = {
        "items": items,
        "back_urls": {
            "success": f"{FRONTEND_URL}/payment/success",
            "failure": f"{FRONTEND_URL}/payment/failure",
            "pending": f"{FRONTEND_URL}/payment/pending"
        },
        "auto_return": "approved",
        "notification_url": f"{BACKEND_URL}/api/checkout/webhook",
        "external_reference": external_reference
    }

    try:
        preference_response = sdk.preference().create(preference_data)
        preference = preference_response["response"]
        return {"preference_id": preference["id"], "init_point": preference["init_point"]}
    except Exception as e:
        logger.error(f"Error inesperado al crear la preferencia de Mercado Pago: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Error interno del servidor al procesar el pago.")

@router.post("/webhook")
async def mercadopago_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    
    body = await request.body()
    
    # --- ROBUSTEZ: Manejo de 'body' vacío (el error JSONDecodeError) ---
    if not body:
        logger.warning("Webhook de MercadoPago recibido con body vacío.")
        return {"status": "ok", "reason": "Empty body, possibly a ping."}

    try:
        data = json.loads(body)
    except json.JSONDecodeError:
        logger.error("Error al decodificar el JSON del webhook de MercadoPago.")
        raise HTTPException(status_code=400, detail="JSON malformado.")

    # Verificamos la firma (solo si el secret está configurado)
    verify_mercadopago_signature(request, body)
    
    if data.get("type") == "payment":
        payment_id = data.get("data", {}).get("id")
        if not payment_id:
            return {"status": "ignored", "reason": "No payment ID"}

        try:
            # --- ROBUSTEZ: Verificación de Idempotencia ---
            # Verificamos si esta orden ya fue procesada
            existing_order = await db.execute(
                select(Orden).filter(Orden.payment_id_mercadopago == str(payment_id))
            )
            if existing_order.scalars().first():
                logger.info(f"Webhook para payment_id {payment_id} ya fue procesado. Omitiendo.")
                return {"status": "ok", "reason": "Already processed"}

            # Obtenemos la info del pago
            payment_info_response = sdk.payment().get(payment_id)
            payment_info = payment_info_response["response"]

            if payment_info["status"] == "approved":
                logger.info(f"Pago aprobado! ID: {payment_id}. Procesando orden...")
                
                # Pasamos el payment_id para guardarlo
                await save_order_and_update_stock(payment_info, db, str(payment_id))
                
        except Exception as e:
            logger.error(f"Error al procesar el webhook de Mercado Pago: {e}")
            # Devolvemos un 200 OK para que MP no reintente, pero logueamos el error
            return {"status": "error", "detail": str(e)}

    return {"status": "ok"}

async def save_order_and_update_stock(payment_info: dict, db: AsyncSession, payment_id: str):
    
    # --- ROBUSTEZ: Transacción Atómica ---
    try:
        usuario_id = payment_info.get("external_reference")
        monto_total = payment_info.get("transaction_amount")
        
        new_order = Orden(
            usuario_id=usuario_id,
            monto_total=monto_total,
            estado="Completado",
            estado_pago="Aprobado",
            metodo_pago="MercadoPago",
            payment_id_mercadopago=payment_id # Guardamos el ID para idempotencia
        )
        db.add(new_order)
        await db.flush() # Hacemos flush para obtener el new_order.id

        items_procesados = []
        for item in payment_info.get("additional_info", {}).get("items", []):
            variante_id = int(item.get("id"))
            cantidad_comprada = int(item.get("quantity"))
            precio_unitario = float(item.get("unit_price"))

            order_detail = DetalleOrden(
                orden_id=new_order.id,
                variante_producto_id=variante_id,
                cantidad=cantidad_comprada,
                precio_en_momento_compra=precio_unitario
            )
            db.add(order_detail)
            items_procesados.append({"id": variante_id, "cantidad": cantidad_comprada})

        # Actualizamos el stock EN LA MISMA TRANSACCIÓN
        for item in items_procesados:
            variante_id = item["id"]
            cantidad_comprada = item["cantidad"]

            # Bloqueamos la fila de la variante para evitar race conditions
            result = await db.execute(
                select(VarianteProducto)
                .where(VarianteProducto.id == variante_id)
                .with_for_update() # ¡Importante!
            )
            variante_producto = result.scalars().first()
            
            if variante_producto:
                if variante_producto.cantidad_en_stock >= cantidad_comprada:
                    variante_producto.cantidad_en_stock -= cantidad_comprada
                    db.add(variante_producto)
                else:
                    logger.error(f"Stock insuficiente para la variante {variante_id} durante la transacción.")
                    # Lanzamos una excepción para forzar el rollback
                    raise Exception(f"Stock insuficiente para {variante_id}")
            else:
                logger.warning(f"No se encontró la variante con ID {variante_id} para descontar stock.")
                # Lanzamos una excepción para forzar el rollback
                raise Exception(f"Variante {variante_id} no encontrada")

        await db.commit() # Si todo salió bien, comiteamos
        logger.info(f"Orden {new_order.id} guardada y stock actualizado exitosamente.")

    except SQLAlchemyExceptions.IntegrityError as e: # Error de DB
        logger.error(f"Error de Integridad de DB al guardar la orden: {e}")
        await db.rollback() # Revertimos
        raise HTTPException(status_code=500, detail="Error de base de datos al guardar la orden.")
    except Exception as e: # Otro error (ej. stock insuficiente)
        logger.error(f"Error al procesar la orden y stock: {e}")
        await db.rollback() # Revertimos
        raise HTTPException(status_code=500, detail=f"Error al procesar la orden: {str(e)}")