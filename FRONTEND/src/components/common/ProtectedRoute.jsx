import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore.js';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore.getState();

  // Usamos un chequeo síncrono para evitar parpadeos
  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;