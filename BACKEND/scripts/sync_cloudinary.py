# En BACKEND/scripts/sync_cloudinary.py

import os
import sys
import asyncio
import cloudinary
import cloudinary.api
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# --- CONFIGURACIÓN ---
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, project_root)
from database.models import Producto

dotenv_path = os.path.join(project_root, '.env')
load_dotenv(dotenv_path=dotenv_path)

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

DATABASE_URL = os.getenv("DB_SQL_URI")
if not DATABASE_URL:
    print("Error: La variable DB_SQL_URI no está definida en el archivo .env")
    sys.exit(1)

engine = create_async_engine(DATABASE_URL)
AsyncSessionLocal = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)


async def main():
    """
    Función principal que ejecuta la sincronización y cierra los recursos.
    """
    print("Iniciando sincronización de imágenes desde Cloudinary...")
    updated_count = 0
    try:
        resources = cloudinary.api.resources(
            type="upload",
            prefix="void_ecommerce_products/",
            max_results=500
        )
        
        image_list = resources.get("resources", [])
        
        if not image_list:
            print("No se encontraron imágenes en la carpeta 'void_ecommerce_products' de Cloudinary.")
            return

        print(f"Se encontraron {len(image_list)} imágenes. Verificando coincidencias...")

        async with AsyncSessionLocal() as db:
            for image in image_list:
                public_id = image["public_id"]
                image_url = image["secure_url"]
                
                filename = public_id.split('/')[-1]
                product_sku = os.path.splitext(filename)[0]
                
                print(f"\nProcesando imagen: {filename} -> SKU extraído: '{product_sku}'")

                result_check = await db.execute(select(Producto).where(Producto.sku == product_sku))
                product_exists = result_check.scalars().first()

                if product_exists:
                    print("  -> COINCIDENCIA ENCONTRADA. Actualizando base de datos...")
                    stmt = update(Producto).where(Producto.sku == product_sku).values(urls_imagenes=image_url)
                    await db.execute(stmt)
                    updated_count += 1
                else:
                    print(f"  -> ADVERTENCIA: No se encontró producto con SKU '{product_sku}'.")

            if updated_count > 0:
                await db.commit()
                print("\nCambios guardados en la base de datos.")
            else:
                 print("\nNo se realizaron cambios en la base de datos.")

    except Exception as e:
        print(f"\nOCURRIÓ UN ERROR DURANTE LA SINCRONIZACIÓN: {e}")
    finally:
        # Cierra la conexión del motor de base de datos de forma segura
        await engine.dispose()
        print("\n--- Sincronización Finalizada ---")
        print(f"Total de productos actualizados: {updated_count}")


if __name__ == "__main__":
    asyncio.run(main())