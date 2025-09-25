# En backend/routers/products_router.py

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from sqlalchemy.orm import selectinload # <-- 1. IMPORTACIÓN CLAVE
from typing import List, Optional

from schemas import product_schemas
from database.database import get_db
from database.models import Producto 

from services import auth_services
from schemas import user_schemas

router = APIRouter(
    prefix="/api/products",
    tags=["Products"]
)

@router.get("/", response_model=List[product_schemas.Product])
async def get_products(
    db: AsyncSession = Depends(get_db),
    material: Optional[str] = Query(None, description="Filtrar por material del producto"),
    precio_max: Optional[float] = Query(None, alias="precio", description="Filtrar por precio máximo"),
    categoria_id: Optional[int] = Query(None, description="Filtrar por ID de categoría"),
    talle: Optional[str] = Query(None, description="Filtrar por talle del producto"),
    color: Optional[str] = Query(None, description="Filtrar por color del producto"),
    skip: int = Query(0, ge=0, description="Número de productos a saltar"),
    limit: int = Query(10, ge=1, le=100, description="Número de productos a devolver"),
    sort_by: Optional[str] = Query(None, description="Ordenar por campo (ej: 'precio_asc', 'precio_desc', 'nombre_asc')")
):
    """
    Obtiene una lista de todos los productos, con filtros, paginación y ordenamiento.
    """
    # --- 2. MODIFICAMOS LA CONSULTA PARA CARGAR LAS VARIANTES ---
    query = (
        select(Producto)
        .options(selectinload(Producto.variantes)) # ¡Esta línea soluciona el error!
    )
    
    # Filtros (sin cambios)
    if material:
        query = query.where(Producto.material.ilike(f"%{material}%"))
    if precio_max:
        query = query.where(Producto.precio <= precio_max)
    if categoria_id:
        query = query.where(Producto.categoria_id == categoria_id)
    if talle:
        query = query.where(Producto.talle.ilike(f"%{talle}%"))
    if color:
        query = query.where(Producto.color.ilike(f"%{color}%"))
    
    # Ordenamiento (sin cambios)
    if sort_by:
        if sort_by == "precio_asc":
            query = query.order_by(Producto.precio.asc())
        elif sort_by == "precio_desc":
            query = query.order_by(Producto.precio.desc())
        elif sort_by == "nombre_asc":
            query = query.order_by(Producto.nombre.asc())
        elif sort_by == "nombre_desc":
            query = query.order_by(Producto.nombre.desc())

    # Paginación (sin cambios)
    query = query.offset(skip).limit(limit)
    
    result = await db.execute(query)
    # Usamos .unique() para evitar duplicados si los filtros causan joins complejos
    products = result.scalars().unique().all()
    
    return products

@router.get("/search", response_model=List[product_schemas.Product])
async def search_products(
    q: str = Query(..., min_length=1, description="Término de búsqueda"),
    db: AsyncSession = Depends(get_db)
):
    """
    Busca productos por nombre o descripción.
    """
    search_term = f"%{q}%"
    query = (
        select(Producto)
        .options(selectinload(Producto.variantes)) # También lo añadimos aquí
        .filter(
            or_(
                Producto.nombre.ilike(search_term),
                Producto.descripcion.ilike(search_term)
            )
        )
    )
    
    result = await db.execute(query)
    products = result.scalars().unique().all()
    
    return products

@router.get("/{product_id}", response_model=product_schemas.Product)
async def get_product(product_id: int, db: AsyncSession = Depends(get_db)):
    """
    Obtiene el detalle de un solo producto por su ID.
    """
    # --- 3. MODIFICAMOS TAMBIÉN ESTA CONSULTA ---
    result = await db.execute(
        select(Producto)
        .options(selectinload(Producto.variantes)) # ¡Y esta!
        .filter(Producto.id == product_id)
    )
    product = result.scalars().first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
        
    return product

# --- RUTAS DE ADMIN (POST, PUT, DELETE) SIN CAMBIOS ---
# Estas rutas no devuelven una lista de productos con variantes,
# por lo que no necesitan la modificación.

@router.post(
    "/", 
    response_model=product_schemas.Product, 
    status_code=status.HTTP_201_CREATED,
    summary="Crear un nuevo producto (Solo Admins)"
)
async def create_product(
    product_in: product_schemas.ProductCreate,
    db: AsyncSession = Depends(get_db),
    current_admin: user_schemas.UserOut = Depends(auth_services.get_current_admin_user) 
):
    existing_product_sku = await db.execute(
        select(Producto).filter(Producto.sku == product_in.sku)
    )
    if existing_product_sku.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ya existe un producto con el SKU: {product_in.sku}"
        )
    new_product = Producto(**product_in.model_dump())
    db.add(new_product)
    await db.commit()
    await db.refresh(new_product)
    return new_product

@router.put(
    "/{product_id}",
    response_model=product_schemas.Product,
    summary="Actualizar un producto (Solo Admins)"
)
async def update_product(
    product_id: int,
    product_in: product_schemas.ProductUpdate,
    db: AsyncSession = Depends(get_db),
    current_admin: user_schemas.UserOut = Depends(auth_services.get_current_admin_user)
):
    product_db = await db.get(Producto, product_id)
    if not product_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado"
        )
    update_data = product_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(product_db, key, value)
    db.add(product_db)
    await db.commit()
    await db.refresh(product_db)
    return product_db

@router.delete(
    "/{product_id}",
    status_code=status.HTTP_200_OK,
    summary="Eliminar un producto (Solo Admins)"
)
async def delete_product(
    product_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: user_schemas.UserOut = Depends(auth_services.get_current_admin_user)
):
    product_db = await db.get(Producto, product_id)
    if not product_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado"
        )
    await db.delete(product_db)
    await db.commit()
    return {"message": "Product deleted successfully"}