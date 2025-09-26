// En FRONTEND/src/pages/LoginPage.jsx

import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext'; // <-- Esta importación ahora funcionará

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const { notify } = useContext(NotificationContext); // <-- Usamos el contexto para notificar
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          username: email,
          password: password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al iniciar sesión');
      }

      const data = await response.json();
      login(data.access_token);
      notify('Inicio de sesión exitoso', 'success'); // Notificación de éxito
      navigate('/');
    } catch (err) {
      setError(err.message);
      notify(err.message, 'error'); // Notificación de error
    }
  };

  return (
    <main className="login-page-container">
      <div className="login-form-section">
        <h1 className="form-title">LOG IN</h1>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="email">E-MAIL</label>
            <input 
              type="email" 
              id="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">PASSWORD</label>
            <input 
              type="password" 
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Link to="/forgot-password" className="forgot-password-link">FORGOT PASSWORD?</Link>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="form-button">LOG IN</button>
        </form>
      </div>

      <div className="signup-section">
        <h2 className="form-subtitle">ARE YOU NOT REGISTERED YET?</h2>
        <p className="signup-text">CREATE AN ACCOUNT</p>
        <Link to="/signup" className="form-button">SIGN UP</Link>
      </div>
    </main>
  );
};

export default LoginPage;