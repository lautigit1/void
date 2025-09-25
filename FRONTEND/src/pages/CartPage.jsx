import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

// La función fetchCart no cambia
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
    const navigate = useNavigate();
    const { data: cart, isLoading, error } = useQuery({
        queryKey: ['cart'],
        queryFn: fetchCart,
    });

    // La lógica de formatPrice y handleRemoveItem no cambia
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

    const subtotal = cart?.items.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;
    const orderTotal = subtotal;

    return (
        <main className="cart-page-container">
            <h1 className="cart-page-title">SHOPPING BAG</h1>
            
            <div className="cart-content">
                <div className="cart-header">
                    <span>ITEM</span>
                    <button onClick={() => navigate(-1)} className="cart-close-btn">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 1L17 17M17 1L1 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                    </button>
                </div>

                {(!cart?.items || cart.items.length === 0) ? (
                    <div className="cart-empty-message">
                        <p>Tu carrito está vacío.</p>
                    </div>
                ) : (
                    <>
                        <div className="cart-items-list">
                            {cart.items.map(item => (
                                <div className="cart-item-row" key={item.variante_id}>
                                    <div className="item-info-left">
                                        <div className="item-image">
                                            <img src={item.image_url || '/img/placeholder.jpg'} alt={item.name} />
                                        </div>
                                        <div className="item-details">
                                            <h3>VOID</h3>
                                            <p>{item.name}</p>
                                            <p>SIZE: L</p>
                                        </div>
                                    </div>
                                    <div className="item-info-right">
                                        <span className="item-price">{formatPrice(item.price * item.quantity)} ARS</span>
                                        <button onClick={() => handleRemoveItem(item.variante_id)} className="item-remove-btn">REMOVE</button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="cart-summary-section">
                            <div className="summary-line">
                                <span>SUBTOTAL</span>
                                <span>{formatPrice(subtotal)} ARS</span>
                            </div>
                            <div className="summary-line">
                                <span>SHIPPING ESTIMATE</span>
                                <span>CALCULATED AT CHECKOUT</span>
                            </div>
                            <div className="summary-line total">
                                <span>ORDER TOTAL</span>
                                <span>{formatPrice(orderTotal)} ARS</span>
                            </div>
                            <div className="checkout-button-container">
                                <Link to="/checkout" className="checkout-button">CHECKOUT</Link>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </main>
    );
};

export default CartPage;