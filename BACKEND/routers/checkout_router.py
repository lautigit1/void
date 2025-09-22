# En backend/routers/checkout_router.py

import mercadopago
import os
import logging
import hmac
import hashlib
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

# CORREGIDO: Importamos los esquemas que vamos a usar
from schemas import cart_schemas
from database.database import get_db
# CORREGIDO: Importamos los modelos nuevos y correctos
from database.models import Orden, DetalleOrden, VarianteProducto, Producto
from services import email_service

router = APIRouter(prefix="/api/checkout", tags=["Checkout"])

# --- CONFIGURACIÓN DE LOGGING ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configura el SDK de Mercado Pago (esto estaba bien)
sdk = mercadopago.SDK(os.getenv("MERCADOPAGO_TOKEN"))
MERCADOPAGO_WEBHOOK_SECRET = os.getenv("MERCADOPAGO_WEBHOOK_SECRET")

# --- URLs de la aplicación (esto estaba bien) ---
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")

def verify_mercadopago_signature(request: Request, payload: bytes):
    if not MERCADOPAGO_WEBHOOK_SECRET:
        logger.warning("MERCADOPAGO_WEBHOOK_SECRET no está configurado. Omitiendo verificación.")
        return

    signature_header = request.headers.get('x-signature')
    if not signature_header:
        raise HTTPException(status_code=400, detail="x-signature header faltante")

    try:
        parts = {p.split('=')[0]: p.split('=')[1] for p in signature_header.split(',')}
        ts = parts.get('ts')
        v1 = parts.get('v1')

        if not ts or not v1:
            raise HTTPException(status_code=400, detail="Firma inválida.")

        manifest = f"id:{request.query_params.get('data.id')};request-id:{request.headers.get('x-request-id')};ts:{ts};"
        
        expected_signature = hmac.new(
            MERCADOPAGO_WEBHOOK_SECRET.encode(),
            msg=manifest.encode(),
            digestmod=hashlib.sha256
        ).hexdigest()

        if not hmac.compare_digest(expected_signature, v1):
            raise HTTPException(status_code=400, detail="Firma inválida.")
    except Exception as e:
        logger.error(f"Error al verificar la firma de Mercado Pago: {e}")
        raise HTTPException(status_code=400, detail="Firma inválida.")

@router.post("/create_preference")
async def create_preference(cart: cart_schemas.Cart):
    items = []
    for item in cart.items:
        items.append({
            "id": item.variante_id,
            "title": item.name,
            "quantity": item.quantity,
            "unit_price": item.price,
            "currency_id": "ARS"
        })

    preference_data = {
        "items": items,
        "back_urls": {
            "success": f"{FRONTEND_URL}/payment/success",
            "failure": f"{FRONTEND_URL}/payment/failure",
            "pending": f"{FRONTEND_URL}/payment/pending"
        },
        "auto_return": "approved",
        "notification_url": f"{BACKEND_URL}/api/checkout/webhook",
        "external_reference": str(cart.user_id)
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
    verify_mercadopago_signature(request, body)
    
    data = await request.json()
    
    if data.get("type") == "payment":
        payment_id = data.get("data", {}).get("id")
        if not payment_id:
            return {"status": "ignored", "reason": "No payment ID"}

        try:
            payment_info_response = sdk.payment().get(payment_id)
            payment_info = payment_info_response["response"]

            if payment_info["status"] == "approved":
                logger.info(f"Pago aprobado! ID: {payment_id}")
                
                await save_order_and_update_stock(payment_info, db)
                
        except Exception as e:
            logger.error(f"Error al procesar el webhook de Mercado Pago: {e}")
            return {"status": "error", "detail": str(e)}

    return {"status": "ok"}

async def save_order_and_update_stock(payment_info: dict, db: AsyncSession):
    usuario_id = payment_info.get("external_reference")
    monto_total = payment_info.get("transaction_amount")
    
    new_order = Orden(
        usuario_id=usuario_id,
        monto_total=monto_total,
        estado="Completado",
        estado_pago="Aprobado",
        metodo_pago="MercadoPago"
    )
    db.add(new_order)
    await db.flush()

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
                logger.error(f"Stock insuficiente para la variante {variante_id}.")
                raise HTTPException(status_code=400, detail="Stock insuficiente.")
        else:
            logger.warning(f"No se encontró la variante con ID {variante_id} para descontar stock.")

    await db.commit()
    logger.info(f"Orden {new_order.id} guardada y stock actualizado.")
