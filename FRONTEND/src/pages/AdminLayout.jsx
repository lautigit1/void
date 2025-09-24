import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';

const AdminLayout = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linkStyle = {
    textDecoration: 'none',
    color: '#333',
    padding: '10px 15px',
    display: 'block',
    borderRadius: '5px',
    marginBottom: '5px'
  };

  const activeLinkStyle = {
    ...linkStyle,
    backgroundColor: '#e9ecef',
    fontWeight: 'bold'
  };

  return (
    <div style={{ display: 'flex', fontFamily: "'Montserrat', sans-serif" }}>
      <aside style={{ width: '250px', background: '#f8f9fa', padding: '1rem', minHeight: 'calc(100vh - 160px)', borderRight: '1px solid #dee2e6', display: 'flex', flexDirection: 'column' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '700' }}>VOID Race Control</h2>
          <nav>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li><NavLink to="/admin" end style={({ isActive }) => isActive ? activeLinkStyle : linkStyle}>Dashboard</NavLink></li>
              <li><NavLink to="/admin/products" style={({ isActive }) => isActive ? activeLinkStyle : linkStyle}>Productos</NavLink></li>
              <li><NavLink to="/admin/users" style={({ isActive }) => isActive ? activeLinkStyle : linkStyle}>Usuarios</NavLink></li>
              <li><NavLink to="/admin/orders" style={({ isActive }) => isActive ? activeLinkStyle : linkStyle}>Órdenes</NavLink></li>
            </ul>
          </nav>
        </div>
        <div style={{ marginTop: 'auto' }}>
          <button onClick={handleLogout} style={{ width: '100%', padding: '0.75rem', background: '#343a40', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: '600', textAlign: 'center' }}>
            CERRAR SESIÓN
          </button>
        </div>
      </aside>
      
      <main style={{ flex: 1, padding: '2rem', background: '#fff' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;