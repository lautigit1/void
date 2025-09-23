import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ isMenuOpen, onToggleMenu }) => {
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
          <Link to="/" className="logo">VOID</Link>
        </div>
        <div className="nav-right">
          <div className="search-container">
            <label className="search-label">SEARCH</label>
            <div className="search-underline"></div>
          </div>
          <a>LANGUAGE</a>
          <a>LOGIN</a>
          <a>BAG</a>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;