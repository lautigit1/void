import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';

const AdminLayout = () => {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-layout-container">
      {/* El componente Outlet renderiza el contenido de la ruta anidada */}
      <Outlet />
      
      {/* El botón de logout se ha movido al AdminDashboard para que el layout sea más simple */}
    </div>
  );
};

export default AdminLayout;