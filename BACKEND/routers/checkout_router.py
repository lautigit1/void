# En backend/routers/checkout_router.py

import mercadopago
import os
import logging
import hmac
import hashlib
import json
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy import exc as SQLAlchemyExceptions

from schemas import cart_schemas
from database.database import get_db
from database.models import Orden, DetalleOrden, VarianteProducto, Producto
from services import email_service

router = APIRouter(prefix="/api/checkout", tags=["Checkout"])

# --- CONFIGURACIÓN DE LOGGING ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configura el SDK de Mercado Pago
sdk = mercadopago.SDK(os.getenv("MERCADOPAGO_ACCESS_TOKEN"))
MERCADOPAGO_WEBHOOK_SECRET = os.getenv("MERCADOPAGO_WEBHOOK_SECRET")

# --- URLs de la aplicación ---
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")

def verify_mercadopago_signature(request: Request, payload: bytes):
    # ... (código existente sin cambios)
    pass

@router.post("/create_preference")
async def create_preference(cart: cart_schemas.Cart, db: AsyncSession = Depends(get_db)):
    
    items = []
    for item_in_cart in cart.items:
        result = await db.execute(
            select(VarianteProducto)
            .options(selectinload(VarianteProducto.producto))
            .where(VarianteProducto.id == item_in_cart.variante_id)
        )
        variante_db = result.scalars().first()
        
        if not variante_db or not variante_db.producto:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, 
                                detail=f"Item con id {item_in_cart.variante_id} no encontrado.")
        
        if variante_db.cantidad_en_stock < item_in_cart.quantity:
             raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, 
                                detail=f"Stock insuficiente para {variante_db.producto.nombre}.")

        items.append({
            "id": str(variante_db.id),
            "title": variante_db.producto.nombre,
            "quantity": item_in_cart.quantity,
            "unit_price": float(variante_db.producto.precio),
            "currency_id": "ARS"
        })

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
        # --- ¡LÍNEA ELIMINADA! ---
        # "auto_return": "approved", 
        "notification_url": f"{BACKEND_URL}/api/checkout/webhook",
        "external_reference": str(external_reference)
    }

    try:
        preference_response = sdk.preference().create(preference_data)
        
        if preference_response.get("status") not in [200, 201]:
            logger.error(f"Error de MercadoPago al crear preferencia: {preference_response}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=preference_response.get("response", {}).get("message", "Error desconocido de MercadoPago")
            )
        
        preference = preference_response.get("response", {})
        
        return {"preference_id": preference.get("id"), "init_point": preference.get("init_point")}

    except Exception as e:
        logger.error(f"Error inesperado al crear la preferencia de Mercado Pago: {e}", exc_info=True)
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail="Error interno del servidor al procesar el pago.")

@router.post("/webhook")
async def mercadopago_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    
    body = await request.body()
    
    if not body:
        logger.warning("Webhook de MercadoPago recibido con body vacío.")
        return {"status": "ok", "reason": "Empty body, possibly a ping."}

    try:
        data = json.loads(body)
    except json.JSONDecodeError:
        logger.error("Error al decodificar el JSON del webhook de MercadoPago.")
        raise HTTPException(status_code=400, detail="JSON malformado.")

    if MERCADOPAGO_WEBHOOK_SECRET:
        verify_mercadopago_signature(request, body)
    
    if data.get("type") == "payment":
        payment_id = data.get("data", {}).get("id")
        if not payment_id:
            return {"status": "ignored", "reason": "No payment ID"}

        try:
            existing_order = await db.execute(
                select(Orden).filter(Orden.payment_id_mercadopago == str(payment_id))
            )
            if existing_order.scalars().first():
                logger.info(f"Webhook para payment_id {payment_id} ya fue procesado. Omitiendo.")
                return {"status": "ok", "reason": "Already processed"}

            payment_info_response = sdk.payment().get(payment_id)
            payment_info = payment_info_response["response"]

            if payment_info["status"] == "approved":
                logger.info(f"Pago aprobado! ID: {payment_id}. Procesando orden...")
                await save_order_and_update_stock(payment_info, db, str(payment_id))
                
        except Exception as e:
            logger.error(f"Error al procesar el webhook de Mercado Pago: {e}")
            return {"status": "error", "detail": str(e)}

    return {"status": "ok"}

async def save_order_and_update_stock(payment_info: dict, db: AsyncSession, payment_id: str):
    
    try:
        usuario_id = payment_info.get("external_reference")
        monto_total = payment_info.get("transaction_amount")
        
        new_order = Orden(
            usuario_id=usuario_id,
            monto_total=monto_total,
            estado="Completado",
            estado_pago="Aprobado",
            metodo_pago="MercadoPago",
            payment_id_mercadopago=payment_id
        )
        db.add(new_order)
        await db.flush()

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

        for item in items_procesados:
            variante_id = item["id"]
            cantidad_comprada = item["cantidad"]

            result = await db.execute(
                select(VarianteProducto)
                .where(VarianteProducto.id == variante_id)
                .with_for_update()
            )
            variante_producto = result.scalars().first()
            
            if variante_producto:
                if variante_producto.cantidad_en_stock >= cantidad_comprada:
                    variante_producto.cantidad_en_stock -= cantidad_comprada
                    db.add(variante_producto)
                else:
                    raise Exception(f"Stock insuficiente para {variante_id}")
            else:
                raise Exception(f"Variante {variante_id} no encontrada")

        await db.commit()
        logger.info(f"Orden {new_order.id} guardada y stock actualizado exitosamente.")

    except SQLAlchemyExceptions.IntegrityError as e:
        logger.error(f"Error de Integridad de DB al guardar la orden: {e}")
        await db.rollback()
        raise HTTPException(status_code=500, detail="Error de base de datos al guardar la orden.")
    except Exception as e:
        logger.error(f"Error al procesar la orden y stock: {e}")
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al procesar la orden: {str(e)}")