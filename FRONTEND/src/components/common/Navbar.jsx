import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/useAuthStore';

// FIX: La prop onOpenCart debe estar en la desestructuración
const Navbar = React.forwardRef(({ isMenuOpen, onToggleMenu, onOpenCart }, ref) => {
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

            {/* FIX: El onClick debe llamar a la función que nos llega por prop */}
            <a onClick={onOpenCart}>BAG</a>
          </div>
        </nav>
      </header>
    );
});

export default Navbar;