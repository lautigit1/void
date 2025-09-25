// En FRONTEND/src/pages/ProductPage.jsx
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getProductById } from '@/services/api';
import { useCart } from '@/hooks/useCart';

// --- Funciones de URL (sin cambios) ---
const transformCloudinaryUrl = (url, width) => {
  if (!url || !url.includes('cloudinary')) {
    return url;
  }
  const parts = url.split('/upload/');
  return `${parts[0]}/upload/f_auto,q_auto:best,w_${width}/${parts[1]}`;
};

const getImageUrls = (urls_imagenes) => {
  const placeholder = ['/img/placeholder.jpg'];
  if (!urls_imagenes) {
    return placeholder;
  }
  let urls = [];
  if (typeof urls_imagenes === 'string' && urls_imagenes.startsWith('["')) {
    try {
      urls = JSON.parse(urls_imagenes);
    } catch (e) {
      return placeholder;
    }
  } else {
    urls = [urls_imagenes];
  }
  return urls;
};

const ProductDetailsContent = ({ product, onAddToCartSuccess }) => {
    const allImageUrls = getImageUrls(product.urls_imagenes);
    const [mainImage, setMainImage] = useState(allImageUrls[0]);

    const availableSizes = product.variantes ? product.variantes.map(v => v.tamanio) : [];
    const [selectedSize, setSelectedSize] = useState(availableSizes.length > 0 ? availableSizes[0] : null);
    const { addItem, isAddingItem } = useCart();

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-AR', {
          style: 'currency',
          currency: 'ARS',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(price).replace("ARS", "$").trim();
    };

    const handleAddToCart = () => {
        if (!selectedSize) {
            alert("Por favor, selecciona un talle.");
            return;
        }
        const selectedVariant = product.variantes.find(v => v.tamanio === selectedSize);
        if (!selectedVariant) {
            console.error("No se encontró la variante para el talle seleccionado.");
            return;
        }
        
        const item = {
            variante_id: selectedVariant.id,
            quantity: 1,
            price: product.precio,
            name: product.nombre,
            size: selectedVariant.tamanio, // <--- CORRECCIÓN CLAVE
            image_url: allImageUrls[0]
        };

        addItem(item, {
            onSuccess: () => {
                // Pasamos el objeto completo a la función de éxito para el modal
                onAddToCartSuccess(item);
            }
        });
    };
    
    const isOutOfStock = availableSizes.length === 0;

    return (
        <div className="product-details-container-full">
            <div 
              className="product-images-column" 
              style={{ flexBasis: '45%', flexShrink: 0 }}
            >
              <div style={{ maxWidth: '450px', margin: '0 auto' }}>
                <div className="main-image-container" style={{ marginBottom: '1rem' }}>
                  <img 
                    src={transformCloudinaryUrl(mainImage, 600)} 
                    alt={product.nombre} 
                    style={{ width: '100%', height: 'auto', objectFit: 'contain' }} 
                  />
                </div>
                <div className="thumbnail-images-container" style={{ display: 'flex', gap: '0.75rem' }}>
                  {allImageUrls.map((url, index) => (
                    <div 
                      key={index} 
                      className="thumbnail-item" 
                      style={{ width: '80px', height: '100px', cursor: 'pointer', border: mainImage === url ? '2px solid black' : '2px solid transparent' }}
                      onClick={() => setMainImage(url)}
                    >
                      <img src={transformCloudinaryUrl(url, 150)} alt={`${product.nombre} - vista ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div 
              className="product-info-panel-full"
              style={{ flexBasis: '55%', paddingLeft: '3rem' }}
            >
                <h1 className="product-name">{product.nombre}</h1>
                <p className="product-style-info">SINGULARITY BLACK / GRAPHITE</p>
                <p className="product-price">{formatPrice(product.precio)} ARS</p>
                
                <div className="product-size-selector">
                    <p className="size-label">SIZE: {selectedSize || 'NO DISPONIBLE'}</p>
                    <div className="size-buttons">
                        {availableSizes.map(size => (
                            <button
                                key={size}
                                className={`size-button ${selectedSize === size ? 'active' : ''}`}
                                onClick={() => setSelectedSize(size)}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="product-description-full">
                    <p>{product.descripcion || "Descripción no disponible."}</p>
                </div>
                
                <button 
                    onClick={handleAddToCart} 
                    disabled={isAddingItem || isOutOfStock}
                    className="void-add-to-bag-btn"
                >
                    {isOutOfStock ? 'SIN STOCK' : (isAddingItem ? 'AGREGANDO...' : 'ADD TO BAG')}
                </button>
            </div>
        </div>
    );
};

// Se pasa onSetAddedItem para el modal de notificación
const ProductPage = ({ onOpenCartModal, onSetAddedItem }) => {
    const { productId } = useParams();
    const { data: product, isLoading, error } = useQuery({
      queryKey: ['product', productId],
      queryFn: () => getProductById(productId),
      enabled: !!productId
    });

    // Esta función ahora recibe el objeto 'item' completo
    const handleAddToCartSuccess = (itemData) => {
        onSetAddedItem(itemData);
        onOpenCartModal();
    };

    if (isLoading) return <div style={{textAlign: 'center', padding: '5rem'}}>Cargando...</div>;
    if (error) return <div style={{textAlign: 'center', padding: '5rem'}}>Error al cargar el producto.</div>;
    if (!product) return <div style={{textAlign: 'center', padding: '5rem'}}>Producto no encontrado.</div>;
    
    return (
        <main>
            <ProductDetailsContent product={product} onAddToCartSuccess={handleAddToCartSuccess} />
        </main>
    );
};

export default ProductPage;