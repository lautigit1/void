// En FRONTEND/src/components/common/ProtectedRoute.jsx

import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext'; // <-- CAMBIO CLAVE: Importa el nuevo contexto
import Spinner from './Spinner'; // Importamos el spinner para una mejor experiencia

const ProtectedRoute = ({ children }) => {
  // --- LÓGICA CORREGIDA ---
  // Ahora escucha al AuthContext, igual que el LoginPage y el Navbar
  const { isAuthenticated, user, loading } = useContext(AuthContext);

  // Mientras el AuthContext está verificando el token (al cargar la página),
  // mostramos un spinner. Esto evita el bucle infinito.
  if (loading) {
    return <Spinner message="Verificando permisos..." />;
  }

  // Cuando termina de cargar, si el usuario está autenticado y es admin,
  // le damos acceso a la ruta.
  if (isAuthenticated && user?.role === 'admin') {
    return children;
  }

  // Si no cumple las condiciones, lo redirigimos al login.
  return <Navigate to="/login" replace />;
};

export default ProtectedRoute;