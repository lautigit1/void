// En FRONTEND/src/pages/ForgotPasswordPage.jsx
import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { NotificationContext } from '../context/NotificationContext';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { notify } = useContext(NotificationContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    console.log(`Solicitud de reseteo para: ${email}`);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setLoading(false);
    notify('Si el email está registrado, recibirás un link para resetear tu contraseña.', 'success');
    setEmail('');
  };

  return (
    <div className="auth-page">
      <div className="auth-form-container">
        <h1>Recuperar Contraseña</h1>
        <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#555' }}>
          Ingresá tu email y te enviaremos un link para que puedas crear una nueva.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar Link'}
          </button>
        </form>
        <p className="auth-switch">
          ¿Te acordaste? <Link to="/login">Volver a Iniciar Sesión</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;