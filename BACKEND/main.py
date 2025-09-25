# En BACKEND/main.py

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

# Imports para la base de datos y modelos
from database.database import engine, get_db
from database.models import Base, Producto
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

# Imports para los routers
from routers import health_router, auth_router, products_router, cart_router, admin_router, chatbot_router, checkout_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()

app = FastAPI(
    title="VOID Backend - Finalizado",
    description="Backend con autenticación, catálogo de productos, carrito de compras, panel de admin y chatbot.",
    version="0.6.0",
    lifespan=lifespan
)

# --- Configuración de CORS ---
origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"mensaje": "Backend de VOID funcionando (Sprint 6)."}

# --- CÓDIGO DE DIAGNÓSTICO TEMPORAL ---
@app.get("/debug-products-json")
async def debug_products_json(db: AsyncSession = Depends(get_db)):
    """
    Endpoint de diagnóstico para ver los datos crudos de los productos.
    """
    result = await db.execute(select(Producto).limit(10))
    products = result.scalars().all()
    
    # Convertimos los resultados a un formato simple para verlos en el navegador
    products_list = [
        {
            "id": p.id,
            "sku": p.sku,
            "nombre": p.nombre,
            "urls_imagenes": p.urls_imagenes
        }
        for p in products
    ]
    return {"data": products_list}
# --- FIN DEL CÓDIGO DE DIAGNÓSTICO ---


# Incluimos todos los routers
app.include_router(health_router.router)
app.include_router(auth_router.router)
app.include_router(products_router.router)
app.include_router(cart_router.router)
app.include_router(admin_router.router)
app.include_router(chatbot_router.router)
app.include_router(checkout_router.router)