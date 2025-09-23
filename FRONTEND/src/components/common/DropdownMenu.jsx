import React, { useState } from 'react';

const DropdownMenu = ({ isOpen, onClose, logoPosition }) => {
  const [activeCategory, setActiveCategory] = useState('menswear');

  const handleCategoryClick = (e, category) => {
    e.preventDefault();
    setActiveCategory(category);
  };
  
  const logoStyle = {
    position: 'fixed', // <-- LA CORRECCIÓN. DEBE SER 'fixed' Y NO 'absolute'.
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
                <li><a href="#" className={`category-link ${activeCategory === 'womenswear' ? 'active-category' : ''}`} onClick={(e) => handleCategoryClick(e, 'womenswear')}>WOMENSWEAR</a></li>
                <li><a href="#" className={`category-link ${activeCategory === 'menswear' ? 'active-category' : ''}`} onClick={(e) => handleCategoryClick(e, 'menswear')}>MENSWEAR</a></li>
              </ul>
            </nav>
            <nav className="dropdown-nav-right">
              <ul className={`submenu ${activeCategory === 'womenswear' ? 'active-submenu' : ''}`}>
                <li><a href="#">DRESSES</a></li>
                <li><a href="#">TOPS</a></li>
                <li><a href="#">SKIRTS</a></li>
              </ul>
              <ul className={`submenu ${activeCategory === 'menswear' ? 'active-submenu' : ''}`}>
                <li><a href="#">HOODIES</a></li>
                <li><a href="#">JACKETS</a></li>
                <li><a href="#">SHIRTS</a></li>
                <li><a href="#">PANTS</a></li>
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