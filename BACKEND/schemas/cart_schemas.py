# En backend/schemas/cart_schemas.py

from pydantic import BaseModel, Field, BeforeValidator, ConfigDict # <-- 1. Importar
from typing import List, Optional
from datetime import datetime
from typing_extensions import Annotated # <-- 2. Importar

# --- 3. Añadir el helper PyObjectId ---
# Le dice a Pydantic: "antes de validar, intenta convertir el valor a string"
PyObjectId = Annotated[str, BeforeValidator(str)]

# Molde para un item individual dentro del carrito
class CartItem(BaseModel):
    variante_id: int
    quantity: int = Field(..., gt=0)
    price: float
    name: str
    image_url: Optional[str] = None

# Molde para el objeto principal del carrito
class Cart(BaseModel):
    
    # --- 4. FIX: Usar PyObjectId para el id ---
    id: Optional[PyObjectId] = Field(None, alias="_id")
    
    user_id: Optional[str] = None
    guest_session_id: Optional[str] = None
    items: List[CartItem] = []
    last_updated: datetime = Field(default_factory=datetime.now)

    # --- 5. FIX: Actualizar a ConfigDict (para Pydantic v2) ---
    model_config = ConfigDict(
        populate_by_name = True,
        arbitrary_types_allowed = True
    )