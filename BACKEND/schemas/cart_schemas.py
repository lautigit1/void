# En backend/schemas/cart_schemas.py

from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# Molde para un item individual dentro del carrito
class CartItem(BaseModel):
    # --- CAMBIO CLAVE ---
    # Cambiamos product_id por variante_id para identificar el item específico
    variante_id: int
    
    quantity: int = Field(..., gt=0)
    price: float
    name: str
    image_url: Optional[str] = None

# Molde para el objeto principal del carrito
class Cart(BaseModel):
    # El alias _id es para MongoDB, pero el carrito lo vamos a manejar en el front
    # o en una DB temporal como Redis. Por ahora lo dejamos así.
    id: Optional[str] = Field(None, alias="_id")
    user_id: Optional[str] = None
    guest_session_id: Optional[str] = None
    items: List[CartItem] = []
    last_updated: datetime = Field(default_factory=datetime.now)

    # La configuración model_config está bien, pero from_attributes es más para SQLAlchemy
    # La dejamos porque no hace daño.
    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True
    }