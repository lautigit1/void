# En BACKEND/services/image_uploader.py

import cloudinary
import cloudinary.uploader
import os
from fastapi import UploadFile, HTTPException, status
from dotenv import load_dotenv

load_dotenv()

# --- Configuración de Cloudinary ---
# Asegúrate de que estas variables estén en tu archivo .env
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

async def upload_product_image(file: UploadFile, product_sku: str) -> str:
    """
    Sube la imagen de un producto a Cloudinary.

    Args:
        file: El archivo de imagen subido desde FastAPI.
        product_sku: El SKU del producto para usarlo como ID público.

    Returns:
        La URL segura de la imagen subida.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El archivo subido no es una imagen."
        )

    try:
        # Usamos el SKU como public_id para evitar duplicados y facilitar la búsqueda.
        # `overwrite=True` reemplazará la imagen si ya existe una con el mismo SKU.
        upload_result = cloudinary.uploader.upload(
            file.file,
            public_id=product_sku,
            folder="void/products",  # Organiza las imágenes en una carpeta dentro de Cloudinary
            overwrite=True,
            resource_type="image"
        )
        
        secure_url = upload_result.get("secure_url")
        if not secure_url:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Cloudinary no devolvió una URL segura."
            )
            
        return secure_url
    except Exception as e:
        print(f"Error al subir la imagen a Cloudinary: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ocurrió un error al subir la imagen."
        )