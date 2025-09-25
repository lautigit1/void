// En FRONTEND/src/pages/ProductPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; // Importamos useMutation y useQueryClient
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

const ProductDetailsContent = ({ product, onAddToCartSuccess }) => {
    const navigate = useNavigate();
    const [selectedSize, setSelectedSize] = useState('L');
    const queryClient = useQueryClient();

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

    // Usamos useMutation para enviar datos al backend
    const { mutate: addToCart } = useMutation({
        mutationFn: async (item) => {
            const token = localStorage.getItem('authToken');
            let guestId = localStorage.getItem('guestSessionId');
            if (!guestId) {
                guestId = uuidv4();
                localStorage.setItem('guestSessionId', guestId);
            }
            
            const headers = { 'X-Guest-Session-ID': guestId };
            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }

            const response = await api.post('/cart/items', item, { headers });
            return response.data;
        },
        onSuccess: (updatedCart) => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
            onAddToCartSuccess(product);
        },
    });

    const handleAddToCart = () => {
        const item = {
            variante_id: product.id, // Suponemos que el ID del producto es el de la variante
            quantity: 1,
            price: product.precio,
            name: product.nombre,
            image_url: product.urls_imagenes
        };
        addToCart(item);
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
        const { data } = await api.get(`/products/${productId}`);
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