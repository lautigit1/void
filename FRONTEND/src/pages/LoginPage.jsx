import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../stores/useAuthStore'; // 1. Importar el store

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login); // 2. Obtenemos la acción de login del store

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const formData = new URLSearchParams();
    formData.append('username', email); // El backend espera 'username' para el email
    formData.append('password', password);

    try {
      const response = await axios.post('http://localhost:8000/api/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const { access_token } = response.data;
      
      // 3. Usamos la acción del store para actualizar el estado global
      login(access_token);

      console.log('Login exitoso!');
      navigate('/'); // Redirigimos al home

    } catch (err) {
      console.error('Error en el login:', err);
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Email o contraseña incorrectos. Por favor, intentá de nuevo.');
      }
    }
  };

  return (
    <main className="login-page-container">
      <div className="login-form-section">
        <h1 className="form-title">LOG IN</h1>
        <form onSubmit={handleLogin} className="login-form">
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
          <a href="#" className="forgot-password-link">FORGOT PASSWORD?</a>
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