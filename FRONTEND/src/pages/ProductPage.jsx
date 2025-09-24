import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
// FIX: No importamos el modal aquí, porque el padre lo renderiza

// Componente reutilizable para los detalles del producto
const ProductDetailsContent = ({ product, onAddToCartSuccess }) => {
    const navigate = useNavigate();
    const [selectedSize, setSelectedSize] = useState('L');
    
    // Agregué una lógica de mock para talles y colores
    const availableSizes = ['S', 'M', 'L', 'XL'];
    const availableColors = ['Black', 'White', 'Gray'];

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-AR', {
          style: 'currency',
          currency: 'ARS',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(price).replace("ARS", "$").trim();
    };

    const handleAddToCart = () => {
        // Lógica para agregar al carrito (pendiente de implementar)
        // FIX: Llamamos a la función que nos llega por prop
        if (onAddToCartSuccess) {
            onAddToCartSuccess(product);
        }
    };

    return (
        <div className="product-details-container-full">
            <div className="product-images-column">
              {product.urls_imagenes && <img src={product.urls_imagenes} alt={product.nombre} />}
            </div>
            
            <div className="product-info-panel-full">
                <h1 className="product-name">{product.nombre}</h1>
                <p className="product-style-info">SINGULARITY BLACK / GRAPHITE</p>
                <p className="product-price">{formatPrice(product.precio)} ARS</p>
                
                <div className="product-size-selector">
                    <p className="size-label">VD SIZE: {selectedSize} / EN 52</p>
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
                    <p>The Asymmetrical Shell Anorak, a signature piece from Void. Engineered from our proprietary Exo-Shell™ technical weave, a lightweight, water-repellent fabric designed for the urban landscape.</p>
                    <p>Its defining feature is the convertible high-neck hood with an offset zip closure, revealing a contrasting graphite lining. The silhouette is cut for a relaxed, contemporary fit with dropped shoulders, while an shirred elastic hem and concealed storm cuffs provide both form and function.</p>
                </div>
                <button onClick={handleAddToCart} className="add-to-cart-button">ADD TO BAG</button>
            </div>
        </div>
    );
};

const ProductPage = ({ onOpenCartModal, onSetAddedProduct }) => {
    const { productId } = useParams();
    const navigate = useNavigate();

    const { data: product, isLoading, error } = useQuery({
      queryKey: ['product', productId],
      queryFn: async () => {
        const { data } = await axios.get(`http://localhost:8000/api/products/${productId}`);
        return data;
      },
      enabled: !!productId
    });

    const handleAddToCartSuccess = (product) => {
        onSetAddedProduct(product);
        onOpenCartModal();
    };

    if (isLoading) return <div>Cargando...</div>;
    if (error) return <div>Error al cargar el producto.</div>;
    if (!product) return <div>Producto no encontrado.</div>;
    
    return (
        <main>
            <ProductDetailsContent product={product} onAddToCartSuccess={handleAddToCartSuccess} />
        </main>
    );
};

export default ProductPage;
export { ProductDetailsContent };