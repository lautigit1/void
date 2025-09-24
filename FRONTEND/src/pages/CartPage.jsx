import React from 'react';
import { useQuery } from '@tanstack/react-query';
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
            <div className="cart-list-wrapper">
                <div className="cart-item-header">
                    <span className="cart-header-label">ITEM</span>
                    <span className="cart-header-label"></span>
                </div>
                {cart.items.map(item => (
                    <div className="cart-item" key={item.variante_id}>
                        <div className="cart-item-details">
                            <div className="cart-item-image">
                                <img src={item.image_url || '/img/placeholder.jpg'} alt={item.name} />
                            </div>
                            <div className="cart-item-info">
                                <h3>VOID</h3>
                                <p>{item.name}</p>
                                <p>SIZE: L</p>
                            </div>
                        </div>
                        <div className="cart-item-actions">
                            <span className="cart-item-price">{formatPrice(item.price)} ARS</span>
                            <button className="remove-item-btn">REMOVE</button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="cart-summary-section">
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
                <Link to="/checkout" className="checkout-button">CHECKOUT</Link>
            </div>
        </main>
    );
};

export default CartPage;