# En backend/schemas/user_schemas.py

# Asegurate de que estos imports estén al principio del archivo
from pydantic import BaseModel, EmailStr, Field, BeforeValidator, ConfigDict # <-- Importar ConfigDict
from typing import Optional
from typing_extensions import Annotated
from bson import ObjectId

# --- EL TRADUCTOR MÁGICO ---
PyObjectId = Annotated[str, BeforeValidator(str)]

# --- Tus modelos base (sin cambios) ---
class Phone(BaseModel):
    prefix: str
    number: str

class UserBase(BaseModel):
    email: EmailStr
    name: str
    last_name: str
    phone: Optional[Phone] = None
    role: str = "user"

class UserCreate(UserBase):
    password: str

# --- LA CLASE CORREGIDA ---
class UserOut(UserBase):
    id: PyObjectId = Field(alias="_id")

    # --- FIX ---
    # Reemplazamos 'class Config:' por 'model_config' usando ConfigDict
    model_config = ConfigDict(
        populate_by_name = True,
        arbitrary_types_allowed = True # Mantenlo por si PyObjectId lo necesita
    )

# --- El resto de tus modelos (sin cambios) ---
class Token(BaseModel):
    access_token: str
    token_type: str

class UserUpdateRole(BaseModel):
    role: str