import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = React.forwardRef(({ isMenuOpen, onToggleMenu }, ref) => {
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
          <Link to="/login">LOGIN</Link>
          <a>BAG</a>
        </div>
      </nav>
    </header>
  );
});

export default Navbar;