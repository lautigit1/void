# En BACKEND/routers/admin_router.py

from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional
from bson import ObjectId
from pymongo.database import Database

# Imports de esquemas
from schemas import admin_schemas, product_schemas, metrics_schemas, user_schemas

# Imports de la base de datos
from database.database import get_db, get_db_nosql
from database.models import Gasto, Orden, DetalleOrden, VarianteProducto, Producto, Categoria

# Imports de servicios
from services.auth_services import get_current_admin_user
# --- 1. AQUÍ ESTÁ EL CAMBIO PRINCIPAL EN LA IMPORTACIÓN ---
from services.image_uploader import upload_product_image 

router = APIRouter(
    prefix="/api/admin",
    tags=["Admin"],
    dependencies=[Depends(get_current_admin_user)]
)

# --- Endpoints de Gastos (Sin cambios) ---

@router.get("/expenses", response_model=List[admin_schemas.Gasto])
async def get_expenses(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Gasto))
    expenses = result.scalars().all()
    return expenses

@router.post("/expenses", response_model=admin_schemas.Gasto, status_code=201)
async def create_expense(gasto: admin_schemas.GastoCreate, db: AsyncSession = Depends(get_db)):
    new_expense = Gasto(**gasto.model_dump())
    db.add(new_expense)
    await db.commit()
    await db.refresh(new_expense)
    return new_expense

# --- Endpoints de Ventas (Sin cambios) ---

@router.get("/sales", response_model=List[admin_schemas.Orden])
async def get_sales(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Orden))
    sales = result.scalars().all()
    return sales

@router.post("/sales", status_code=201)
async def create_manual_sale(sale_data: admin_schemas.ManualSaleCreate, db: AsyncSession = Depends(get_db)):
    total_calculado = 0
    for item in sale_data.items:
        result = await db.execute(
            select(VarianteProducto.producto.precio).join(Producto).where(VarianteProducto.id == item.variante_producto_id)
        )
        precio_producto = result.scalar_one_or_none()
        if not precio_producto:
            raise HTTPException(status_code=404, detail=f"Variante de producto con ID {item.variante_producto_id} no encontrada.")
        total_calculado += precio_producto * item.cantidad

    new_order = Orden(
        usuario_id=sale_data.usuario_id,
        monto_total=total_calculado,
        estado=sale_data.estado,
        estado_pago="pagado"
    )
    db.add(new_order)
    await db.flush()

    for item in sale_data.items:
        result = await db.execute(
            select(VarianteProducto.producto.precio).join(Producto).where(VarianteProducto.id == item.variante_producto_id)
        )
        precio_producto = result.scalar_one()
        
        order_detail = DetalleOrden(
            orden_id=new_order.id,
            variante_producto_id=item.variante_producto_id,
            cantidad=item.cantidad,
            precio_en_momento_compra=precio_producto
        )
        db.add(order_detail)

    await db.commit()
    await db.refresh(new_order)
    return {"message": "Venta manual registrada exitosamente", "order_id": new_order.id}


# --- Endpoints de Productos (MODIFICADOS) ---

@router.post("/products", response_model=product_schemas.Product, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_data: product_schemas.ProductCreate = Depends(),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    existing_product = await db.execute(select(Producto).filter(Producto.sku == product_data.sku))
    if existing_product.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ya existe un producto con el SKU: {product_data.sku}"
        )
        
    # --- 2. CAMBIO EN LA LLAMADA A LA FUNCIÓN ---
    # Ya no usamos el prefijo 'image_uploader.'
    image_url = await upload_product_image(file, product_data.sku)
    
    product_dict = product_data.model_dump()
    product_dict["urls_imagenes"] = image_url

    db_product = Producto(**product_dict)
    
    db.add(db_product)
    await db.commit()
    await db.refresh(db_product)
    return db_product


@router.put("/products/{product_id}", response_model=product_schemas.Product)
async def update_product(
    product_id: int,
    product_data: product_schemas.ProductUpdate = Depends(),
    file: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db)
):
    db_product = await db.get(Producto, product_id)
    if not db_product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
    
    if file:
        # --- 3. CAMBIO EN LA LLAMADA A LA FUNCIÓN ---
        image_url = await upload_product_image(file, db_product.sku)
        db_product.urls_imagenes = image_url

    update_data = product_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_product, key, value)
    
    await db.commit()
    await db.refresh(db_product)
    return db_product


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(product_id: int, db: AsyncSession = Depends(get_db)):
    db_product = await db.get(Producto, product_id)
    if not db_product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
    
    await db.delete(db_product)
    await db.commit()
    return


# --- Endpoints de Usuarios (Sin cambios) ---

@router.get("/users", response_model=List[user_schemas.UserOut])
async def get_users(db: Database = Depends(get_db_nosql)):
    users_cursor = db.users.find({})
    users = [user_schemas.UserOut(**user) async for user in users_cursor]
    return users

@router.put("/users/{user_id}", response_model=user_schemas.UserOut)
async def update_user_role(user_id: str, user_update: user_schemas.UserUpdateRole, db: Database = Depends(get_db_nosql)):
    try:
        object_id = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="ID de usuario inválido")

    user = await db.users.find_one({"_id": object_id})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")

    await db.users.update_one(
        {"_id": object_id},
        {"$set": {"role": user_update.role}}
    )

    updated_user = await db.users.find_one({"_id": object_id})
    return user_schemas.UserOut(**updated_user)


# --- Endpoints de Métricas y Gráficos (Sin cambios) ---

@router.get("/metrics/kpis", response_model=metrics_schemas.KPIMetrics)
async def get_kpis(db: AsyncSession = Depends(get_db), db_nosql: Database = Depends(get_db_nosql)):
    total_revenue_result = await db.execute(select(func.sum(Orden.monto_total)))
    total_revenue = total_revenue_result.scalar_one_or_none() or 0.0

    total_orders_result = await db.execute(select(func.count(Orden.id)))
    total_orders = total_orders_result.scalar_one_or_none() or 0

    average_ticket = total_revenue / total_orders if total_orders > 0 else 0.0

    total_users = await db_nosql.users.count_documents({})

    total_expenses_result = await db.execute(select(func.sum(Gasto.monto)))
    total_expenses = total_expenses_result.scalar_one_or_none() or 0.0

    return metrics_schemas.KPIMetrics(
        total_revenue=total_revenue,
        average_ticket=average_ticket,
        total_orders=total_orders,
        total_users=total_users,
        total_expenses=total_expenses
    )

@router.get("/metrics/products", response_model=metrics_schemas.ProductMetrics)
async def get_product_metrics(db: AsyncSession = Depends(get_db)):
    most_sold_product_result = await db.execute(
        select(Producto.nombre, func.sum(DetalleOrden.cantidad).label("total_sold"))
        .join(VarianteProducto, Producto.id == VarianteProducto.producto_id)
        .join(DetalleOrden, VarianteProducto.id == DetalleOrden.variante_producto_id)
        .group_by(Producto.nombre)
        .order_by(func.sum(DetalleOrden.cantidad).desc())
        .limit(1)
    )
    most_sold_product_data = most_sold_product_result.first()
    most_sold_product_name = most_sold_product_data.nombre if most_sold_product_data else "N/A"

    product_with_most_stock_result = await db.execute(
        select(Producto.nombre)
        .order_by(Producto.stock.desc())
        .limit(1)
    )
    product_with_most_stock_name = product_with_most_stock_result.scalar_one_or_none()

    category_with_most_products_result = await db.execute(
        select(Categoria.nombre, func.count(Producto.id).label("product_count"))
        .join(Producto, Categoria.id == Producto.categoria_id)
        .group_by(Categoria.nombre)
        .order_by(func.count(Producto.id).desc())
        .limit(1)
    )
    category_with_most_products_data = category_with_most_products_result.first()
    category_with_most_products_name = category_with_most_products_data.nombre if category_with_most_products_data else "N/A"

    return metrics_schemas.ProductMetrics(
        most_sold_product=most_sold_product_name,
        product_with_most_stock=product_with_most_stock_name,
        category_with_most_products=category_with_most_products_name
    )

@router.get("/charts/sales-over-time", response_model=metrics_schemas.SalesOverTimeChart)
async def get_sales_over_time(db: AsyncSession = Depends(get_db)):
    sales_data = await db.execute(
        select(
            func.date(Orden.creado_en).label("fecha"),
            func.sum(Orden.monto_total).label("total")
        )
        .group_by(func.date(Orden.creado_en))
        .order_by(func.date(Orden.creado_en))
    )
    result = [metrics_schemas.SalesDataPoint(fecha=row.fecha, total=float(row.total)) for row in sales_data.all()]
    return metrics_schemas.SalesOverTimeChart(data=result)

@router.get("/charts/expenses-by-category", response_model=metrics_schemas.ExpensesByCategoryChart)
async def get_expenses_by_category(db: AsyncSession = Depends(get_db)):
    expenses_data = await db.execute(
        select(
            Gasto.categoria,
            func.sum(Gasto.monto).label("monto")
        )
        .group_by(Gasto.categoria)
        .order_by(func.sum(Gasto.monto).desc())
    )
    result = [metrics_schemas.ExpensesByCategoryDataPoint(categoria=row.categoria, monto=float(row.monto)) for row in expenses_data.all()]
    return metrics_schemas.ExpensesByCategoryChart(data=result)