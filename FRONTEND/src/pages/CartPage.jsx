// En FRONTEND/src/pages/CartPage.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
// ¡CAMBIO CLAVE #1: Importamos el hook que tiene toda la magia!
import { useCart } from '@/hooks/useCart';

const CartPage = () => {
    const navigate = useNavigate();
    // ¡CAMBIO CLAVE #2: Usamos el hook para traer el carrito Y la función de borrar!
    const { cart, isLoading, error, removeItem, isRemovingItem } = useCart();

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price).replace("ARS", "$").trim();
    };

    // ¡CAMBIO CLAVE #3: La función ahora es mucho más simple!
    // Simplemente llama a la función removeItem del hook.
    const handleRemoveItem = (variante_id) => {
        removeItem(variante_id);
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
                                            <p>SIZE: {item.size}</p>
                                        </div>
                                    </div>
                                    <div className="item-info-right">
                                        <span className="item-price">{formatPrice(item.price * item.quantity)} ARS</span>
                                        <button 
                                            onClick={() => handleRemoveItem(item.variante_id)} 
                                            className="item-remove-btn"
                                            disabled={isRemovingItem} // Deshabilitamos el botón mientras borra
                                        >
                                            REMOVE
                                        </button>
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