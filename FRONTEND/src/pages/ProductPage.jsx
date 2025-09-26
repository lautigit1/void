// En FRONTEND/src/pages/ProductPage.jsx

import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { CartContext } from '../context/CartContext'; // <-- CAMBIO: Importa el contexto del carrito
import { NotificationContext } from '../context/NotificationContext';
import Spinner from '../components/common/Spinner';

// --- Funciones de URL que ya tenías ---
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
  } else if (Array.isArray(urls_imagenes)) {
    urls = urls_imagenes;
  } else {
    urls = [urls_imagenes];
  }
  return urls.length > 0 ? urls : placeholder;
};

// --- Componente de la página del producto ---
const ProductPage = ({ onOpenCartModal, onSetAddedItem }) => {
    const { productId } = useParams();
    // --- ¡CAMBIO CLAVE! ---
    // Usamos useContext para obtener las funciones, en lugar del hook 'useCart'
    const { addItemToCart } = useContext(CartContext);
    const { notify } = useContext(NotificationContext);

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [mainImage, setMainImage] = useState('');
    const [allImageUrls, setAllImageUrls] = useState([]);

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/products/${productId}`);
                if (!response.ok) throw new Error('No se pudo encontrar el producto.');
                const data = await response.json();
                setProduct(data);

                const imageUrls = getImageUrls(data.urls_imagenes);
                setAllImageUrls(imageUrls);
                setMainImage(imageUrls[0]);

                // Preseleccionar el primer talle disponible
                if (data.variantes && data.variantes.length > 0) {
                    setSelectedSize(data.variantes[0].tamanio);
                }

            } catch (err) {
                setError(err.message);
                notify(err.message, 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [productId, notify]);

    const handleAddToCart = () => {
        if (!selectedSize) {
            notify("Por favor, selecciona un talle.", "error");
            return;
        }

        const selectedVariant = product.variantes.find(v => v.tamanio === selectedSize);

        if (!selectedVariant || selectedVariant.cantidad_en_stock <= 0) {
            notify("Esta variante no tiene stock disponible.", "error");
            return;
        }

        const itemToAdd = {
            variante_id: selectedVariant.id,
            quantity: 1,
            price: product.precio,
            name: product.nombre,
            size: selectedVariant.tamanio,
            image_url: allImageUrls[0],
        };
        
        addItemToCart(itemToAdd);
        onSetAddedItem(itemToAdd);
        onOpenCartModal();
    };

    if (loading) return <Spinner message="Cargando producto..." />;
    if (error) return <div className="error-container" style={{ textAlign: 'center', padding: '5rem' }}><h1>Error: {error}</h1></div>;
    if (!product) return <div style={{ textAlign: 'center', padding: '5rem' }}><h1>Producto no encontrado.</h1></div>;

    const availableSizes = product.variantes ? product.variantes.map(v => v.tamanio) : [];
    const isOutOfStock = availableSizes.length === 0;
    
    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-AR', {
          style: 'currency',
          currency: 'ARS',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(price).replace("ARS", "$").trim();
    };

    return (
        <main>
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
                        disabled={isOutOfStock}
                        className="void-add-to-bag-btn"
                    >
                        {isOutOfStock ? 'SIN STOCK' : 'ADD TO BAG'}
                    </button>
                </div>
            </div>
        </main>
    );
};

export default ProductPage;