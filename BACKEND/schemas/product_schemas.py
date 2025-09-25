# En backend/schemas/product_schemas.py

from pydantic import BaseModel, Field
from typing import Optional, List

# Schema para mostrar la información de una variante de producto.
# Esto le permite a Pydantic entender cómo es un objeto de variante.
class VarianteProductoOut(BaseModel):
    id: int
    tamanio: str
    color: str
    cantidad_en_stock: int

    class Config:
        # Permite que Pydantic lea los datos desde un objeto de SQLAlchemy
        # (conocido como orm_mode en Pydantic v1).
        from_attributes = True

# Schema base del producto, con los campos comunes.
class ProductBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    precio: float
    sku: str
    urls_imagenes: Optional[str] = None # Aseguramos que coincida con el modelo de DB
    material: Optional[str] = None
    # Los campos talle, color y stock ahora pertenecen a las variantes,
    # pero los mantenemos como opcionales por si tienes productos simples sin variantes.
    talle: Optional[str] = None
    color: Optional[str] = None
    stock: int = Field(..., ge=0) # ge=0 significa "mayor o igual a 0"
    categoria_id: int

# Schema para crear un producto. Hereda todo de ProductBase.
class ProductCreate(ProductBase):
    pass

# Schema para actualizar un producto. Todos los campos son opcionales.
class ProductUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    precio: Optional[float] = None
    sku: Optional[str] = None
    urls_imagenes: Optional[str] = None
    material: Optional[str] = None
    talle: Optional[str] = None
    color: Optional[str] = None
    stock: Optional[int] = Field(None, ge=0)
    categoria_id: Optional[int] = None

# MODIFICADO: Schema principal para mostrar un producto en las respuestas de la API.
class Product(ProductBase):
    id: int
    # --- ¡CAMBIO CLAVE! ---
    # Le decimos a Pydantic que un producto tendrá una lista de variantes.
    # Cuando la API devuelva un producto, incluirá todos sus talles y colores aquí.
    variantes: List[VarianteProductoOut] = []

    class Config:
        from_attributes = True