import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
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

const CartModal = ({ isOpen, onClose }) => {
    const { data: cart, isLoading, error } = useQuery({
        queryKey: ['cart'],
        queryFn: fetchCart,
        enabled: isOpen,
    });
    
    if (!isOpen) return null;
    if (isLoading) return <div className="cart-modal-overlay"><div className="cart-modal-content"><p>Cargando carrito...</p></div></div>;
    if (error) return <div className="cart-modal-overlay"><div className="cart-modal-content"><p>Error al cargar el carrito. Por favor, asegúrate de haber iniciado sesión o de haber añadido un producto previamente.</p></div></div>;

    const subtotal = cart?.items.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;
    const orderTotal = subtotal;

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price).replace("ARS", "$").trim();
    };

    return (
        <div className="cart-modal-overlay" onClick={onClose}>
            <div className="cart-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="cart-modal-header">
                    <h2>SHOPPING BAG</h2>
                    <button onClick={onClose} className="cart-modal-close-btn">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 1L17 17M17 1L1 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                    </button>
                </div>
                
                <div className="cart-items-list">
                    {cart?.items && cart.items.length > 0 ? (
                        cart.items.map(item => (
                            <div className="cart-item" key={item.variante_id}>
                                <div className="cart-item-image">
                                    <img src={item.image_url || '/img/placeholder.jpg'} alt={item.name} />
                                </div>
                                <div className="cart-item-details">
                                    <h3>VOID</h3>
                                    <p>{item.name}</p>
                                    <p>SIZE: L</p>
                                </div>
                                <div className="cart-item-info">
                                    <span className="cart-item-price">{formatPrice(item.price * item.quantity)} ARS</span>
                                    <button className="cart-item-remove-btn">REMOVE</button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="empty-cart-message">Tu carrito está vacío.</p>
                    )}
                </div>

                <div className="cart-summary-section">
                    <div className="cart-summary-line">
                        <span className="cart-summary-label">SUBTOTAL</span>
                        <span className="cart-summary-value">{formatPrice(subtotal)} ARS</span>
                    </div>
                    <div className="cart-summary-line">
                        <span className="cart-summary-label">SHIPPING ESTIMATE</span>
                        <span className="cart-summary-value">CALCULATED AT CHECKOUT</span>
                    </div>
                    <div className="cart-summary-line total">
                        <span className="cart-summary-label">ORDER TOTAL</span>
                        <span className="cart-summary-value">{formatPrice(orderTotal)} ARS</span>
                    </div>
                </div>
                
                <div className="cart-buttons-section">
                    <Link to="/cart" className="cart-button-link view-bag">VIEW BAG</Link>
                    <Link to="/checkout" className="cart-button-link checkout">CHECKOUT</Link>
                </div>
            </div>
        </div>
    );
};

export default CartModal;