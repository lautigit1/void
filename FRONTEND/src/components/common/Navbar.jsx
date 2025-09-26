// En FRONTEND/src/components/common/Navbar.jsx

import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';

// Lo envolvemos en forwardRef para que pueda recibir el 'ref' desde App.jsx
const Navbar = React.forwardRef(({ isMenuOpen, onToggleMenu, onOpenCart, onOpenSearch }, ref) => {
    const { isAuthenticated, user } = useAuthStore();
    const navigate = useNavigate();

    const [isSearching, setIsSearching] = useState(false);
    const [query, setQuery] = useState('');
    const searchInputRef = useRef(null);

    useEffect(() => {
        if (isSearching) {
            searchInputRef.current?.focus();
        }
    }, [isSearching]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/search?q=${encodeURIComponent(query.trim())}`);
            setQuery('');
            setIsSearching(false);
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
            {/* Le asignamos el 'ref' que viene desde App.jsx */}
            <Link to="/" className="logo" ref={ref}>VOID</Link>
          </div>

          <div className="nav-right">
            <div className="search-container">
              {isSearching ? (
                <form onSubmit={handleSearchSubmit}>
                  <input
                    ref={searchInputRef}
                    type="text"
                    className="search-input-active"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onBlur={() => { if (!query.trim()) { setIsSearching(false); } }}
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

            <a onClick={onOpenCart} style={{cursor: 'pointer'}}>BAG</a>
          </div>
        </nav>
      </header>
    );
});

export default Navbar;