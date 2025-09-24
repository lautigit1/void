import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore'; // 1. Importamos el store

const Navbar = React.forwardRef(({ isMenuOpen, onToggleMenu }, ref) => {
  // 2. Obtenemos el estado y las acciones que necesitamos del store
  const { isAuthenticated, user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    // Idealmente, aquí redirigirías al usuario, por ejemplo a la home.
    // Esto se puede hacer con `useNavigate` de react-router-dom si es necesario.
  };

  return (
    <header className="main-header">
      <nav className="main-nav">
        <div className="nav-left">
          <button
            className={`hamburger-menu ${isMenuOpen ? 'open' : ''}`}
            aria-label="Abrir menú"
            aria-expanded={isMenuOpen}
            onClick={onToggleMenu}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
        <div className="nav-center">
          <Link to="/" className="logo" ref={ref}>VOID</Link>
        </div>
        <div className="nav-right">
          <div className="search-container">
            <label className="search-label">SEARCH</label>
            <div className="search-underline"></div>
          </div>
          <a>LANGUAGE</a>

          {/* 3. Lógica condicional para mostrar los links correctos */}
          {isAuthenticated ? (
            <>
              {/* Mostramos el link al panel SÓLO si el usuario es admin */}
              {user?.role === 'admin' && (
                <Link to="/admin">ADMIN</Link>
              )}
              {/* Usamos un <a> o <button> para el logout ya que no es una navegación */}
              <a onClick={handleLogout} style={{ cursor: 'pointer' }}>LOGOUT</a>
            </>
          ) : (
            // Si no está autenticado, mostramos el link de Login
            <Link to="/login">LOGIN</Link>
          )}

          <a>BAG</a>
        </div>
      </nav>
    </header>
  );
});

export default Navbar;