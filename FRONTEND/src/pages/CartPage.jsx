import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import axios from 'axios';

const fetchCart = async () => {
    try {
        const token = localStorage.getItem('authToken');
        const guestId = localStorage.getItem('guestSessionId');
        
        const headers = {};
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        } else if (guestId) {
            headers['X-Guest-Session-ID'] = guestId;
        }

        const { data } = await axios.get('http://localhost:8000/api/cart/', { headers });
        return data;
    } catch (error) {
        console.error("Error fetching cart:", error);
        throw error;
    }
};

const CartPage = () => {
    const queryClient = useQueryClient();
    const { data: cart, isLoading, error } = useQuery({
        queryKey: ['cart'],
        queryFn: fetchCart,
    });

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price).replace("ARS", "$").trim();
    };

    const handleRemoveItem = async (variante_id) => {
        const token = localStorage.getItem('authToken');
        const guestId = localStorage.getItem('guestSessionId');
        
        const headers = {};
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        } else if (guestId) {
            headers['X-Guest-Session-ID'] = guestId;
        }

        try {
            await axios.delete(`http://localhost:8000/api/cart/items/${variante_id}`, { headers });
            queryClient.invalidateQueries({ queryKey: ['cart'] });
        } catch (error) {
            console.error("Error removing item:", error);
        }
    };


    if (isLoading) return <main className="cart-page-container"><p>Cargando carrito...</p></main>;
    if (error) return <main className="cart-page-container"><p>Error al cargar el carrito.</p></main>;
    if (!cart?.items || cart.items.length === 0) {
        return (
            <main className="cart-page-container">
                <h1 className="cart-title">SHOPPING BAG</h1>
                <p className="empty-cart-message">Tu carrito está vacío.</p>
                <Link to="/catalog/all" className="back-to-shop-link">EXPLORAR PRODUCTOS</Link>
            </main>
        );
    }

    const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const orderTotal = subtotal;

    return (
        <main className="cart-page-container">
            <h1 className="cart-title">SHOPPING BAG</h1>
            
            <div className="cart-content-wrapper">
                <div className="cart-item-header">
                    <span className="cart-header-label">ITEM</span>
                    <button className="cart-modal-close-btn" onClick={() => window.history.back()}>
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 1L17 17M17 1L1 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                    </button>
                </div>
                
                {cart.items.map(item => (
                    <div className="cart-item-new-style" key={item.variante_id}>
                        <div className="item-details-left">
                            <div className="cart-item-image">
                                <img src={item.image_url || '/img/placeholder.jpg'} alt={item.name} />
                            </div>
                            <div className="cart-item-info">
                                <h3>VOID</h3>
                                <p>{item.name}</p>
                                <p>SIZE: L</p>
                            </div>
                        </div>
                        <div className="item-details-right">
                            <span className="cart-item-price-new">{formatPrice(item.price)} ARS</span>
                            <button className="remove-item-btn-new" onClick={() => handleRemoveItem(item.variante_id)}>REMOVE</button>
                        </div>
                    </div>
                ))}

                <div className="cart-summary-section-new">
                    <div className="cart-summary-line">
                        <span className="summary-label">SUBTOTAL</span>
                        <span className="summary-value">{formatPrice(subtotal)} ARS</span>
                    </div>
                    <div className="cart-summary-line">
                        <span className="summary-label">SHIPPING ESTIMATE</span>
                        <span className="summary-value">CALCULATED AT CHECKOUT</span>
                    </div>
                    <div className="cart-summary-line total-line">
                        <span className="summary-label">ORDER TOTAL</span>
                        <span className="summary-value">{formatPrice(orderTotal)} ARS</span>
                    </div>
                    <Link to="/checkout" className="checkout-button-new">CHECKOUT</Link>
                </div>
            </div>
        </main>
    );
};

export default CartPage;