import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // 1. IMPORTAMOS Link

const DropdownMenu = ({ isOpen, onClose, logoPosition }) => {
  const [activeCategory, setActiveCategory] = useState('menswear');

  const handleCategoryClick = (e, category) => {
    // Ya no prevenimos la navegación, solo cambiamos la categoría activa
    setActiveCategory(category);
  };
  
  const logoStyle = {
    position: 'fixed',
    top: `${logoPosition.top}px`,
    left: `${logoPosition.left}px`,
    width: `${logoPosition.width}px`,
    height: `${logoPosition.height}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: isOpen ? 1 : 0,
    transition: 'opacity 0.2s ease-in-out',
  };

  return (
    <>
      <div 
        className={`overlay ${isOpen ? 'active' : ''}`} 
        onClick={onClose}
      ></div>
      
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
          
          <div className="dropdown-logo" style={logoStyle}>VOID</div>
        </div>
        
        <div className="dropdown-content">
          <div className="menu-categories">
            <nav className="dropdown-nav-left">
              <ul>
                {/* 2. CAMBIAMOS <a> POR <Link> y añadimos onClick={onClose} */}
                <li>
                  <Link 
                    to="/catalog/womenswear"
                    className={`category-link ${activeCategory === 'womenswear' ? 'active-category' : ''}`} 
                    onClick={(e) => { handleCategoryClick(e, 'womenswear'); onClose(); }}
                  >
                    WOMENSWEAR
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/catalog/menswear"
                    className={`category-link ${activeCategory === 'menswear' ? 'active-category' : ''}`} 
                    onClick={(e) => { handleCategoryClick(e, 'menswear'); onClose(); }}
                  >
                    MENSWEAR
                  </Link>
                </li>
              </ul>
            </nav>
            <nav className="dropdown-nav-right">
              <ul className={`submenu ${activeCategory === 'womenswear' ? 'active-submenu' : ''}`}>
                <li><Link to="/catalog/dresses" onClick={onClose}>DRESSES</Link></li>
                <li><Link to="/catalog/tops" onClick={onClose}>TOPS</Link></li>
                <li><Link to="/catalog/skirts" onClick={onClose}>SKIRTS</Link></li>
              </ul>
              <ul className={`submenu ${activeCategory === 'menswear' ? 'active-submenu' : ''}`}>
                <li><Link to="/catalog/hoodies" onClick={onClose}>HOODIES</Link></li>
                <li><Link to="/catalog/jackets" onClick={onClose}>JACKETS</Link></li>
                <li><Link to="/catalog/shirts" onClick={onClose}>SHIRTS</Link></li>
                <li><Link to="/catalog/pants" onClick={onClose}>PANTS</Link></li>
              </ul>
            </nav>
          </div>

          <div className="dropdown-footer">
            <div className="footer-images">
              <div className="footer-image left">
                <img src="/img/dropdownIzquierda.jpg" alt="Carretera" />
              </div>
              <div className="footer-image right">
                <img src="/img/dropdownDerecha.jpg" alt="Autopista" />
              </div>
            </div>
            <h3 className="footer-text">FIND YOUR OWN ROAD</h3>
          </div>
        </div>
      </aside>
    </>
  );
};

export default DropdownMenu;