import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    lastName: '',
    phonePrefix: '+54',
    phoneNumber: '',
    acceptPrivacy: false,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.acceptPrivacy) {
      setError('Debes aceptar la declaración de privacidad para continuar.');
      return;
    }

    try {
      // Preparamos el payload como lo espera el backend
      const apiPayload = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        last_name: formData.lastName,
        phone: {
          prefix: formData.phonePrefix,
          number: formData.phoneNumber,
        },
      };

      await axios.post('http://localhost:8000/api/auth/register', apiPayload);

      setSuccess('¡Cuenta creada con éxito! Serás redirigido al login.');
      
      // Esperamos un momento para que el usuario lea el mensaje y luego redirigimos
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Ocurrió un error al registrar la cuenta. Por favor, intentá de nuevo.');
      }
      console.error('Error en el registro:', err);
    }
  };

  return (
    <main className="register-page-container">
      <h1 className="form-title">REGISTER</h1>
      <form onSubmit={handleSubmit} className="register-form">
        <div className="input-group">
          <label htmlFor="email">E-MAIL</label>
          <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div className="input-group">
          <label htmlFor="password">PASSWORD</label>
          <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required />
        </div>
        <div className="input-group">
          <label htmlFor="name">NAME</label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div className="input-group">
          <label htmlFor="lastName">LAST NAME</label>
          <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required />
        </div>

        <div className="phone-input-group">
          <div className="input-group prefix">
            <label htmlFor="phonePrefix">PREFIX</label>
            <input type="text" id="phonePrefix" name="phonePrefix" value={formData.phonePrefix} onChange={handleChange} />
          </div>
          <div className="input-group phone-number">
            <label htmlFor="phoneNumber">PHONE</label>
            <input type="tel" id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} />
          </div>
        </div>

        <div className="checkbox-group">
          <label className="checkbox-container-register">
            <input type="checkbox" name="acceptPrivacy" checked={formData.acceptPrivacy} onChange={handleChange} />
            <span className="checkmark-register"></span>
            I ACCEPT THE <a href="/privacy" className="privacy-link">PRIVACY STATEMENT</a>
          </label>
        </div>

        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        <button type="submit" className="form-button outline">CREATE AN ACCOUNT</button>
      </form>
    </main>
  );
};

export default RegisterPage;