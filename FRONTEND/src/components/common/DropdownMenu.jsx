// En FRONTEND/src/components/common/DropdownMenu.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const DropdownMenu = ({ isOpen, onClose, logoPosition }) => {
  const [activeCategory, setActiveCategory] = useState('menswear');

  const handleLinkClick = () => {
    onClose();
  };

  // Estilo para el logo "fantasma" que se posiciona
  const logoStyle = {
    position: 'fixed',
    top: `${logoPosition.top}px`,
    left: `${logoPosition.left}px`,
    width: `${logoPosition.width}px`,
    height: `${logoPosition.height}px`,
    color: '#000', // El logo en negro sobre el menú blanco
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2003, // Por encima del menú pero debajo del botón de cerrar
    opacity: isOpen ? 1 : 0, // Aparece y desaparece con el menú
    transition: 'opacity 0.2s ease-in-out',
    pointerEvents: 'none', // Para que no se pueda clickear
  };

  return (
    <>
      <div 
        className={`overlay ${isOpen ? 'active' : ''}`} 
        onClick={onClose}
      />
      
      <aside className={`dropdown-menu ${isOpen ? 'open' : ''}`}>
        <div className="dropdown-header">
          <button
            className={`close-btn ${isOpen ? 'open' : ''}`}
            aria-label="Cerrar menú"
            onClick={onClose}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
        
        {/* ¡EL LOGO FANTASMA! Se posiciona solo con la data de App.jsx */}
        <div className="logo" style={logoStyle}>VOID</div>

        <div className="dropdown-content">
          <div className="menu-categories">
            <nav className="dropdown-nav-left">
              <ul>
                <li>
                  <Link to="/catalog/womenswear" onClick={handleLinkClick} className={`category-link ${activeCategory === 'womenswear' ? 'active-category' : ''}`}>
                    WOMENSWEAR
                  </Link>
                </li>
                <li>
                  <Link to="/catalog/menswear" onClick={handleLinkClick} className={`category-link ${activeCategory === 'menswear' ? 'active-category' : ''}`}>
                    MENSWEAR
                  </Link>
                </li>
              </ul>
            </nav>
            <nav className="dropdown-nav-right">
              <ul className={`submenu ${activeCategory === 'womenswear' ? 'active-submenu' : ''}`}>
                <li><Link to="/catalog/dresses" onClick={handleLinkClick}>DRESSES</Link></li>
                <li><Link to="/catalog/tops" onClick={handleLinkClick}>TOPS</Link></li>
              </ul>
              <ul className={`submenu ${activeCategory === 'menswear' ? 'active-submenu' : ''}`}>
                <li><Link to="/catalog/hoodies" onClick={handleLinkClick}>HOODIES</Link></li>
                <li><Link to="/catalog/jackets" onClick={handleLinkClick}>JACKETS</Link></li>
                <li><Link to="/catalog/shirts" onClick={handleLinkClick}>SHIRTS</Link></li>
                <li><Link to="/catalog/pants" onClick={handleLinkClick}>PANTS</Link></li>
              </ul>
            </nav>
          </div>

          <div className="dropdown-footer">
            <div className="footer-images">
              <div className="footer-image left"><img src="/img/dropdownIzquierda.jpg" alt="Carretera" /></div>
              <div className="footer-image right"><img src="/img/dropdownDerecha.jpg" alt="Autopista" /></div>
            </div>
            <h3 className="footer-text">FIND YOUR OWN ROAD</h3>
          </div>
        </div>
      </aside>
    </>
  );
};

export default DropdownMenu;