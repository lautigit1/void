// En FRONTEND/src/components/products/CartModal.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart'; // <-- ¡Importamos el hook!

const CartModal = ({ isOpen, onClose }) => {
    // ¡Toda la lógica compleja ahora vive en una sola línea!
    const { cart, isLoading, error, removeItem } = useCart();
    
    if (!isOpen) return null;
    
    if (isLoading) return <div className="cart-modal-overlay"><div className="cart-modal-content"><p>Cargando carrito...</p></div></div>;
    if (error) return <div className="cart-modal-overlay"><div className="cart-modal-content"><p>Error al cargar el carrito.</p></div></div>;

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

    const handleRemoveItem = (variante_id) => {
        removeItem(variante_id);
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
                                    <button onClick={() => handleRemoveItem(item.variante_id)} className="cart-item-remove-btn">REMOVE</button>
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