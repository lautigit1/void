// En FRONTEND/src/pages/CheckoutPage.jsx
import React, { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { createMercadoPagoPreference } from '@/services/api'; // ¡Importamos la nueva función!

const CheckoutPage = () => {
    // Estado para los campos del formulario
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        streetAddress: '',
        comments: '',
        city: '',
        postalCode: '',
        country: '',
        state: '',
        prefix: '+54',
        phone: ''
    });

    // Estado para el método de envío
    const [shippingMethod, setShippingMethod] = useState('express'); // 'express' o 'standard'

    // Estado para el método de pago
    const [paymentMethod, setPaymentMethod] = useState('credit'); // 'credit' o 'mercadoPago'

    // Usamos el hook del carrito para el resumen del pedido
    const { cart, isLoading, error } = useCart();

    const subtotal = cart?.items.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;
    const shippingCost = shippingMethod === 'express' ? 8000 : 0; // Ejemplo de costo de envío
    const total = subtotal + shippingCost;

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // --- ¡AQUÍ ESTÁ LA LÓGICA MODIFICADA! ---
    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        if (paymentMethod !== 'mercadoPago') {
            alert('Por favor, selecciona Mercado Pago como método de pago para continuar.');
            return;
        }

        if (!cart || cart.items.length === 0) {
            alert('Tu carrito está vacío.');
            return;
        }

        try {
            // 1. Llamamos al backend para crear la preferencia de pago
            const preference = await createMercadoPagoPreference(cart);
            
            // 2. Si todo sale bien, redirigimos al usuario al checkout de MP
            if (preference.init_point) {
                window.location.href = preference.init_point;
            }
        } catch (error) {
            console.error('Error al crear la preferencia de pago:', error);
            alert('No se pudo iniciar el proceso de pago. Por favor, intenta de nuevo.');
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price).replace("ARS", "$").trim();
    };

    if (isLoading) return <div className="checkout-page-container"><p>Cargando carrito...</p></div>;
    if (error) return <div className="checkout-page-container"><p>Error al cargar el carrito para el checkout.</p></div>;

    return (
        <main className="checkout-page-container">
            <h1 className="checkout-title">CHECKOUT</h1>

            <div className="checkout-content">
                <form onSubmit={handlePlaceOrder} className="checkout-form-section">
                    {/* SHIPPING ADDRESS */}
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

                    {/* SHIPPING METHOD */}
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
                        {/* <label className="radio-option">
                            <input 
                                type="radio" 
                                name="shippingMethod" 
                                value="standard" 
                                checked={shippingMethod === 'standard'} 
                                onChange={() => setShippingMethod('standard')} 
                            />
                            <span>{formatPrice(0)} ARS</span> STANDARD
                            <p className="description">DELIVERY BETWEEN 5 TO 10 BUSINESS DAY</p>
                        </label> */}
                    </div>

                    {/* PAYMENT METHOD */}
                    <h2 className="section-title mt-8">PAYMENT METHOD</h2>
                    <div className="payment-options">
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

                {/* ORDER SUMMARY */}
                <div className="order-summary-section">
                    <h2 className="section-title">ORDER SUMARY</h2>
                    {cart?.items.map(item => (
                        <div className="order-item" key={item.variante_id}>
                            <img src={item.image_url || '/img/placeholder.jpg'} alt={item.name} className="order-item-image" />
                            <div className="order-item-details">
                                <p className="item-name">VOID ASYMMETRICAL SHELL ANORAK</p>
                                <p className="item-size">SIZE L</p>
                            </div>
                            <span className="item-price">{formatPrice(item.price * item.quantity)} ARS</span>
                        </div>
                    ))}

                    <div className="summary-line subtotal">
                        <span>SUBTOTAL</span>
                        <span>{formatPrice(subtotal)} ARS</span>
                    </div>
                    {/* Línea de Shipping si existiera */}
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

                    <button type="submit" onClick={handlePlaceOrder} className="place-order-button">PLACE ORDER</button>
                </div>
            </div>
        </main>
    );
};

export default CheckoutPage;