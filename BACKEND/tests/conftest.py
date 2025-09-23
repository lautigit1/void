# tests/conftest.py
import sys
import os
import pytest
import pytest_asyncio
import asyncio
from httpx import AsyncClient, ASGITransport
import mongomock
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

# Add the project root to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))


# --- Importaciones de tu app ---
from main import app
# Importaciones SQL
from database.database import get_db
from database.models import Producto, Base
# Importaciones NoSQL
from database.database import get_db_nosql
from utils.security import get_password_hash, create_access_token

# --- Configuración del Event Loop para la sesión ---
@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

# --- Async Mock Classes for mongomock (NoSQL) ---
class AsyncMongoMockCollection:
    def __init__(self, sync_collection):
        self._sync_collection = sync_collection
    async def find_one(self, *args, **kwargs):
        return self._sync_collection.find_one(*args, **kwargs)
    async def insert_one(self, *args, **kwargs):
        return self._sync_collection.insert_one(*args, **kwargs)
    async def update_one(self, *args, **kwargs):
        return self._sync_collection.update_one(*args, **kwargs)
    async def delete_one(self, *args, **kwargs):
        return self._sync_collection.delete_one(*args, **kwargs)
    async def find(self, *args, **kwargs):
        return self._sync_collection.find(*args, **kwargs)

class AsyncMongoMock:
    def __init__(self, sync_db):
        self._sync_db = sync_db
    def __getattr__(self, name):
        collection = getattr(self._sync_db, name)
        return AsyncMongoMockCollection(collection)

# --- Fixtures de NoSQL (Mongo) ---
@pytest_asyncio.fixture(scope="function")
async def mongo_client():
    return mongomock.MongoClient()

@pytest_asyncio.fixture(scope="function")
async def db_nosql(mongo_client):
    yield AsyncMongoMock(mongo_client.test_db)

@pytest_asyncio.fixture(autouse=True)
async def override_get_db_nosql(db_nosql):
    """Reemplaza get_db_nosql en la app por la DB NoSQL de prueba"""
    async def _override():
        yield db_nosql
    app.dependency_overrides[get_db_nosql] = _override
    yield
    app.dependency_overrides.pop(get_db_nosql, None)

# --- Fixtures de SQL (SQLite en memoria) ---
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"
test_engine = create_async_engine(TEST_DATABASE_URL)
TestingSessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=test_engine, class_=AsyncSession
)

@pytest_asyncio.fixture(scope="function")
async def db_sql():
    """Fixture para la sesión de DB SQL (usada por Products)"""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    async with TestingSessionLocal() as session:
        yield session
    
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest_asyncio.fixture(autouse=True)
async def override_get_db_sql(db_sql: AsyncSession):
    """Reemplaza get_db (SQL) en la app por la DB SQL de prueba"""
    async def _override_get_db():
        yield db_sql
    app.dependency_overrides[get_db] = _override_get_db
    yield
    app.dependency_overrides.pop(get_db, None)

# --- Fixture de cliente HTTP (Respeta Lifespan) ---
@pytest_asyncio.fixture(scope="function")
async def client() -> AsyncClient:
    """Cliente HTTP para testear la API que respeta el lifespan."""
    async with ASGITransport(app=app) as transport:
        async with AsyncClient(transport=transport, base_url="http://test") as ac:
            yield ac

# --- Fixtures de datos de prueba (NoSQL) ---
@pytest_asyncio.fixture
async def test_user(db_nosql): # Depende de db_nosql
    user_data = {
        "username": "testuser",
        "email": "testuser@example.com",
        "name": "Test",
        "last_name": "User",
        "hashed_password": get_password_hash("password"),
        "role": "user",
    }
    
    # --- FIX ---
    # Capturamos el resultado y añadimos el _id al dict
    # para que el fixture 'authenticated_client' pueda crear el token.
    result = await db_nosql.users.insert_one(user_data)
    user_data["_id"] = result.inserted_id
    
    return user_data

@pytest_asyncio.fixture
async def test_admin(db_nosql): # Depende de db_nosql
    admin_data = {
        "username": "adminuser",
        "email": "admin@example.com",
        "name": "Admin",
        "last_name": "User",
        "hashed_password": get_password_hash("adminpassword"),
        "role": "admin",
    }
    result = await db_nosql.users.insert_one(admin_data)
    admin_data["_id"] = result.inserted_id
    return admin_data

@pytest_asyncio.fixture
async def test_product_nosql(db_nosql): # Depende de db_nosql
    """Producto de prueba en NoSQL (para tests de Carrito)"""
    product_data = {
        "name": "Test Product NoSQL",
        "description": "A product for testing",
        "price": 10.99,
        "stock": 100,
        "variantes": [
            {"tamanio": "M", "color": "Negro", "cantidad_en_stock": 50, "id": 1},
            {"tamanio": "L", "color": "Blanco", "cantidad_en_stock": 50, "id": 2}
        ]
    }
    result = await db_nosql.products.insert_one(product_data)
    product_data["_id"] = result.inserted_id
    return product_data

# NUEVO: Fixture de producto SQL
@pytest_asyncio.fixture
async def test_product_sql(db_sql: AsyncSession): # Depende de db_sql
    """Producto de prueba en SQL (para tests de Productos)"""
    product_data = {
        "nombre": "Test Product SQL",
        "descripcion": "A product for testing",
        "precio": 10.99,
        "sku": "SQL-SKU-123",
        "material": "Algodon",
        "talle": "M",
        "color": "Negro",
        "stock": 100,
        "categoria_id": 1
    }
    new_product = Producto(**product_data)
    db_sql.add(new_product)
    await db_sql.commit()
    await db_sql.refresh(new_product)
    return new_product

@pytest_asyncio.fixture
def test_variant(test_product_nosql: dict): # Depende del producto NoSQL
    """Returns a variant from the test product."""
    variant = test_product_nosql["variantes"][0]
    return {
        "variante_id": variant["id"],
        "quantity": 1,
        "price": test_product_nosql["price"],
        "name": test_product_nosql["name"],
        "image_url": None
    }

# --- Fixtures de autenticación ---
@pytest_asyncio.fixture
async def authenticated_client(client: AsyncClient, test_user: dict) -> AsyncClient:
    token_data = {
        "sub": test_user["email"], 
        "user_id": str(test_user.get("_id")), # .get() para seguridad
        "role": test_user.get("role", "user")
    }
    token = create_access_token(token_data)
    client.headers.update({"Authorization": f"Bearer {token}"})
    return client

@pytest_asyncio.fixture
async def admin_authenticated_client(client: AsyncClient, test_admin: dict) -> AsyncClient:
    token_data = {
        "sub": test_admin["email"], 
        "user_id": str(test_admin.get("_id")), # .get() para seguridad
        "role": test_admin.get("role", "admin")
    }
    token = create_access_token(token_data)
    client.headers.update({"Authorization": f"Bearer {token}"})
    return client