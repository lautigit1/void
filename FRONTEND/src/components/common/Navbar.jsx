// En FRONTEND/src/components/common/Navbar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';

const Navbar = React.forwardRef(({ isMenuOpen, onToggleMenu, onOpenCart }, ref) => {
    const { isAuthenticated, user } = useAuthStore();
    const navigate = useNavigate();

    // Estados para controlar la búsqueda
    const [isSearching, setIsSearching] = useState(false);
    const [query, setQuery] = useState('');
    const searchInputRef = useRef(null);

    // Efecto para poner el foco en el input cuando aparece
    useEffect(() => {
        if (isSearching) {
            searchInputRef.current?.focus();
        }
    }, [isSearching]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/search?q=${encodeURIComponent(query.trim())}`);
            setQuery(''); // Limpiamos el input
            setIsSearching(false); // Volvemos al estado normal
        }
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
            
            {/* --- ACÁ ESTÁ TODA LA LÓGICA NUEVA --- */}
            <div className="search-container">
              {isSearching ? (
                <form onSubmit={handleSearchSubmit}>
                  <input
                    ref={searchInputRef}
                    type="text"
                    className="search-input-active"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onBlur={() => {
                        // Si el usuario hace clic afuera y no escribió nada, se cierra
                        if (!query.trim()) {
                            setIsSearching(false);
                        }
                    }}
                    placeholder=""
                  />
                  <div className="search-underline"></div>
                </form>
              ) : (
                <div onClick={() => setIsSearching(true)} style={{ cursor: 'text' }}>
                  <label className="search-label">SEARCH</label>
                  <div className="search-underline"></div>
                </div>
              )}
            </div>
            {/* --- FIN DE LA LÓGICA NUEVA --- */}

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

            <Link to="/cart">BAG</Link>
          </div>
        </nav>
      </header>
    );
});

export default Navbar;