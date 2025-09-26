// En FRONTEND/src/pages/AdminLayout.jsx
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
    <div className="admin-dashboard-container">
      <aside className="admin-sidebar">
        <nav>
          <ul>
            <li><NavLink to="/admin">Dashboard</NavLink></li>
            <li><NavLink to="/admin/products">Productos</NavLink></li>
            <li><NavLink to="/admin/orders">Órdenes</NavLink></li>
            <li><NavLink to="/admin/users">Usuarios</NavLink></li>
          </ul>
        </nav>
        <button onClick={handleLogout} className="admin-upload-button" style={{ marginTop: 'auto', width: '100%' }}>
          LOGOUT
        </button>
      </aside>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;