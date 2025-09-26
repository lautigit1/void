// En FRONTEND/src/pages/ContactPage.jsx
import React from 'react';

const ContactPage = () => {
  return (
    <div className="contact-page-container">
      <h1>Contacto</h1>
      <div className="contact-content">
        <div className="contact-info">
          <h2>Hablemos</h2>
          <p>¿Tenés alguna duda sobre un producto, tu orden o simplemente querés saludarnos? Usá el formulario o escribinos directamente.</p>
          <p><strong>Email:</strong><br/>soporte@void.com</p>
          <p><strong>Horarios:</strong><br/>Lunes a Viernes, 9am - 6pm</p>
        </div>
        <div className="contact-form-container">
          <form className="contact-form">
            <div className="form-group">
              <label htmlFor="name">Nombre</label>
              <input type="text" id="name" required />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" required />
            </div>
            <div className="form-group">
              <label htmlFor="message">Mensaje</label>
              <textarea id="message" rows="6" required></textarea>
            </div>
            <button type="submit" className="auth-button">Enviar Mensaje</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;