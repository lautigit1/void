# En BACKEND/schemas/cart_schemas.py
from pydantic import BaseModel, Field, BeforeValidator, ConfigDict
from typing import List, Optional
from datetime import datetime
from typing_extensions import Annotated

PyObjectId = Annotated[str, BeforeValidator(str)]

# Molde para un item individual dentro del carrito
class CartItem(BaseModel):
    variante_id: int
    quantity: int = Field(..., gt=0)
    price: float
    name: str
    image_url: Optional[str] = None
    size: Optional[str] = None # <-- ¡CAMBIO ESENCIAL! Se añade el campo para el talle.

# Molde para el objeto principal del carrito
class Cart(BaseModel):
    id: Optional[PyObjectId] = Field(None, alias="_id")
    user_id: Optional[str] = None
    guest_session_id: Optional[str] = None
    items: List[CartItem] = []
    last_updated: datetime = Field(default_factory=datetime.now)

    model_config = ConfigDict(
        populate_by_name = True,
        arbitrary_types_allowed = True
    )