# En tests/test_products_router.py
import pytest
from httpx import AsyncClient
from fastapi import status
from database.models import Producto 
from sqlalchemy.ext.asyncio import AsyncSession

# ... (los tests GET y POST que ya pasan) ...

@pytest.mark.asyncio
async def test_get_product_by_id_not_found(client: AsyncClient):
    non_existent_id = 9999 # <-- Ya era int, perfecto
    response = await client.get(f"/api/products/{non_existent_id}")
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json()["detail"] == "Producto no encontrado"


@pytest.mark.asyncio
async def test_create_product_as_admin(admin_authenticated_client: AsyncClient):
    # ... (código sin cambios, ya pasa) ...
    pass

@pytest.mark.asyncio
async def test_create_product_as_user_forbidden(authenticated_client: AsyncClient):
    # ... (código sin cambios, ya pasa) ...
    pass

# --- FIX: 'skip' eliminado ---
@pytest.mark.asyncio
async def test_update_product_as_admin(
    admin_authenticated_client: AsyncClient, test_product_sql: Producto
):
    """Prueba que un admin puede actualizar un producto."""
    
    # --- FIX ---
    # Usamos 'int', no 'str'
    product_id = test_product_sql.id 
    
    update_data = {"precio": 15.99, "stock": 75}
    response = await admin_authenticated_client.put(
        f"/api/products/{product_id}", json=update_data
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["precio"] == update_data["precio"]
    assert data["stock"] == update_data["stock"]


# --- FIX: 'skip' eliminado ---
@pytest.mark.asyncio
async def test_update_product_not_found(admin_authenticated_client: AsyncClient):
    """Prueba que no se puede actualizar un producto que no existe."""
    
    # --- FIX ---
    # Usamos 'int', no 'str'
    non_existent_id = 9999 
    
    response = await admin_authenticated_client.put(
        f"/api/products/{non_existent_id}", json={"precio": 1.0}
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND


# --- FIX: 'skip' eliminado ---
@pytest.mark.asyncio
async def test_delete_product_as_admin(
    admin_authenticated_client: AsyncClient, test_product_sql: Producto, db_sql: AsyncSession
):
    """Prueba que un admin puede borrar un producto."""
    
    # --- FIX ---
    # Usamos 'int', no 'str'
    product_id = test_product_sql.id
    
    response = await admin_authenticated_client.delete(f"/api/products/{product_id}")
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["message"] == "Product deleted successfully"

    product_in_db = await db_sql.get(Producto, product_id)
    assert product_in_db is None


# --- FIX: 'skip' eliminado ---
@pytest.mark.asyncio
async def test_delete_product_not_found(admin_authenticated_client: AsyncClient):
    """Prueba que no se puede borrar un producto que no existe."""
    
    # --- FIX ---
    # Usamos 'int', no 'str'
    non_existent_id = 9999
    
    response = await admin_authenticated_client.delete(f"/api/products/{non_existent_id}")
    assert response.status_code == status.HTTP_404_NOT_FOUND