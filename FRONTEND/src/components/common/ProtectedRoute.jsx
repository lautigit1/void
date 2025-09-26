// En FRONTEND/src/components/common/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore.js';

const ProtectedRoute = ({ children }) => {
  // --- ¡CAMBIO CLAVE #1: Así se usa el hook para que reaccione a los cambios! ---
  const { isAuthenticated, user, isAuthLoading } = useAuthStore();

  // --- ¡CAMBIO CLAVE #2: Mientras chequea la sesión, mostramos algo o nada! ---
  if (isAuthLoading) {
    return <div>Verificando permisos...</div>; // O un spinner fachero
  }

  // --- ¡CAMBIO CLAVE #3: Ahora sí, esta lógica se ejecuta con la data actualizada! ---
  if (!isAuthenticated || user?.role !== 'admin') {
    // Si no es admin o no está logueado, lo mandamos al login.
    return <Navigate to="/login" replace />;
  }

  // Si pasó todas las pruebas, es un campeón, que pase.
  return children;
};

export default ProtectedRoute;