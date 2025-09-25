import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';

// FIX: La prop onOpenCart ya no es necesaria
const Navbar = React.forwardRef(({ isMenuOpen, onToggleMenu }, ref) => {
    const { isAuthenticated, user, logout } = useAuthStore();

    const handleLogout = () => {
      logout();
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

            {isAuthenticated ? (
              <>
                {user?.role === 'admin' && (
                  <Link to="/admin">ADMIN</Link>
                )}
              </>
            ) : (
              <Link to="/login">LOGIN</Link>
            )}

            {/* FIX: CAMBIADO a un componente <Link> para navegar a la página del carrito */}
            <Link to="/cart">BAG</Link>
          </div>
        </nav>
      </header>
    );
});

export default Navbar;