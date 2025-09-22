# Asegurate de que estos imports estén al principio del archivo
from pydantic import BaseModel, EmailStr, Field, BeforeValidator
from typing import Optional
from typing_extensions import Annotated
from bson import ObjectId

# --- EL TRADUCTOR MÁGICO ---
# Le dice a Pydantic: "antes de validar, intenta convertir el valor a string"
PyObjectId = Annotated[str, BeforeValidator(str)]

# --- Tus modelos como los tenías (están perfectos) ---
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

# --- LA CLASE CORREGIDA Y DEFINITIVA ---
class UserOut(UserBase):
    # Usamos nuestro traductor 'PyObjectId' en lugar de 'str'
    # y mantenemos el alias a "_id"
    id: PyObjectId = Field(alias="_id")

    class Config:
        # Esto está perfecto, le dice a Pydantic que use el alias
        populate_by_name = True
        # Este ya no es necesario porque estamos manejando el tipo correctamente
        # arbitrary_types_allowed = True

# --- El resto de tus modelos (están perfectos) ---
class Token(BaseModel):
    access_token: str
    token_type: str

class UserUpdateRole(BaseModel):
    role: str
    
    
    
