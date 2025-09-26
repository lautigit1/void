// En FRONTEND/src/pages/CheckoutPage.jsx

import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { NotificationContext } from '../context/NotificationContext';
import Spinner from '../components/common/Spinner';

const CheckoutPage = () => {
    // Estado para todos los campos del formulario, restaurado
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        streetAddress: '',
        comments: '',
        city: '',
        postalCode: '',
        country: 'Argentina', // Valor por defecto
        state: '',
        prefix: '+54', // Valor por defecto
        phone: ''
    });

    const [shippingMethod, setShippingMethod] = useState('express');
    const [paymentMethod, setPaymentMethod] = useState('mercadoPago');
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Lógica actualizada con React Context
    const { cart, loading } = useContext(CartContext);
    const { notify } = useContext(NotificationContext);
    const navigate = useNavigate();

    const subtotal = cart?.items.reduce((sum, item) => sum + item.quantity * item.price, 0) || 0;
    const shippingCost = shippingMethod === 'express' ? 8000 : 0;
    const total = subtotal + shippingCost;

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        setIsProcessing(true);

        if (!cart || cart.items.length === 0) {
            notify('Tu carrito está vacío.', 'error');
            setIsProcessing(false);
            return;
        }

        // Flujo para redirección a Mercado Pago
        if (paymentMethod === 'mercadoPago') {
            try {
                const response = await fetch('http://127.0.0.1:8000/api/checkout/create_preference', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(cart)
                });

                const preference = await response.json();
                if (!response.ok) {
                    throw new Error(preference.detail || 'No se pudo iniciar el proceso de pago.');
                }

                if (preference.init_point) {
                    window.location.href = preference.init_point;
                }
            } catch (error) {
                console.error('Error al crear la preferencia de pago:', error);
                notify(error.message, 'error');
                setIsProcessing(false);
            }
        }

        // Flujo para pago con tarjeta (actualmente no implementado en el backend de esta versión)
        if (paymentMethod === 'credit') {
            notify('El pago directo con tarjeta no está implementado en esta versión.', 'error');
            setIsProcessing(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency', currency: 'ARS',
            minimumFractionDigits: 0, maximumFractionDigits: 0,
        }).format(price).replace("ARS", "$").trim();
    };

    if (loading) return <div className="checkout-page-container"><Spinner message="Cargando..." /></div>;

    return (
        <main className="checkout-page-container">
            <h1 className="checkout-title">CHECKOUT</h1>
            <div className="checkout-content">
                <form onSubmit={handlePlaceOrder} className="checkout-form-section">
                    {/* --- ¡FORMULARIO COMPLETO RESTAURADO! --- */}
                    <h2 className="section-title">SHIPPING ADDRESS</h2>
                    <div className="form-grid">
                        <div className="input-group">
                            <label htmlFor="firstName">FIRST NAME</label>
                            <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleFormChange} required />
                        </div>
                        <div className="input-group">
                            <label htmlFor="lastName">LAST NAME</label>
                            <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleFormChange} required />
                        </div>
                        <div className="input-group full-width">
                            <label htmlFor="streetAddress">STREET ADDRESS</label>
                            <input type="text" id="streetAddress" name="streetAddress" value={formData.streetAddress} onChange={handleFormChange} required />
                        </div>
                        <div className="input-group">
                            <label htmlFor="comments">COMMENTS (OPCIONAL)</label>
                            <input type="text" id="comments" name="comments" value={formData.comments} onChange={handleFormChange} />
                        </div>
                        <div className="input-group">
                            <label htmlFor="city">CITY</label>
                            <input type="text" id="city" name="city" value={formData.city} onChange={handleFormChange} required />
                        </div>
                        <div className="input-group">
                            <label htmlFor="postalCode">POSTAL CODE</label>
                            <input type="text" id="postalCode" name="postalCode" value={formData.postalCode} onChange={handleFormChange} required />
                        </div>
                        <div className="input-group">
                            <label htmlFor="country">COUNTRY</label>
                            <input type="text" id="country" name="country" value={formData.country} onChange={handleFormChange} required />
                        </div>
                        <div className="input-group">
                            <label htmlFor="state">STATE</label>
                            <input type="text" id="state" name="state" value={formData.state} onChange={handleFormChange} required />
                        </div>
                        <div className="input-group">
                            <label htmlFor="prefix">PREFIX</label>
                            <input type="text" id="prefix" name="prefix" value={formData.prefix} onChange={handleFormChange} />
                        </div>
                        <div className="input-group">
                            <label htmlFor="phone">PHONE</label>
                            <input type="text" id="phone" name="phone" value={formData.phone} onChange={handleFormChange} required />
                        </div>
                    </div>

                    <h2 className="section-title mt-8">SHIPPING METHOD</h2>
                    <div className="shipping-options">
                        <label className="radio-option">
                            <input 
                                type="radio" 
                                name="shippingMethod" 
                                value="express" 
                                checked={shippingMethod === 'express'} 
                                onChange={() => setShippingMethod('express')} 
                            />
                            <span>{formatPrice(8000)} ARS</span> EXPRESS
                            <p className="description">DELIVERY BETWEEN 2 TO 5 BUSINESS DAY</p>
                        </label>
                    </div>

                    <h2 className="section-title mt-8">PAYMENT METHOD</h2>
                    <div className="payment-options">
                        {/* --- ¡OPCIÓN DE PAGO CON TARJETA RESTAURADA! --- */}
                        <label className="radio-option">
                            <input 
                                type="radio" 
                                name="paymentMethod" 
                                value="credit" 
                                checked={paymentMethod === 'credit'} 
                                onChange={() => setPaymentMethod('credit')} 
                            />
                            <span>PAY WITH CREDIT OR DEBIT CARD</span>
                        </label>
                        <label className="radio-option">
                            <input 
                                type="radio" 
                                name="paymentMethod" 
                                value="mercadoPago" 
                                checked={paymentMethod === 'mercadoPago'} 
                                onChange={() => setPaymentMethod('mercadoPago')} 
                            />
                            <span>PAY WITH MERCADO PAGO</span>
                        </label>
                    </div>
                </form>

                <div className="order-summary-section">
                    <h2 className="section-title">ORDER SUMMARY</h2>
                    {cart?.items.map(item => (
                        <div className="order-item" key={item.variante_id}>
                            <img src={item.image_url || '/img/placeholder.jpg'} alt={item.name} className="order-item-image" />
                            <div className="order-item-details">
                                <p className="item-name">{item.name}</p>
                                <p className="item-size">SIZE {item.size}</p>
                            </div>
                            <span className="item-price">{formatPrice(item.price * item.quantity)} ARS</span>
                        </div>
                    ))}
                    <div className="summary-line subtotal">
                        <span>SUBTOTAL</span>
                        <span>{formatPrice(subtotal)} ARS</span>
                    </div>
                    {shippingCost > 0 && (
                        <div className="summary-line shipping">
                            <span>SHIPPING</span>
                            <span>{formatPrice(shippingCost)} ARS</span>
                        </div>
                    )}
                    <div className="summary-line total">
                        <span>TOTAL</span>
                        <span>{formatPrice(total)} ARS</span>
                    </div>
                    <button type="submit" onClick={handlePlaceOrder} className="place-order-button" disabled={isProcessing}>
                        {isProcessing ? 'PROCESANDO...' : 'PLACE ORDER'}
                    </button>
                </div>
            </div>
        </main>
    );
};

export default CheckoutPage;