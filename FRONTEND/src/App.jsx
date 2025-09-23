import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/common/Navbar.jsx';
import Footer from './components/common/Footer.jsx';
import DropdownMenu from './components/common/DropdownMenu.jsx';
import HomePage from './pages/HomePage.jsx';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logoPosition, setLogoPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const logoRef = useRef(null);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    const updatePosition = () => {
      if (logoRef.current) {
        setLogoPosition(logoRef.current.getBoundingClientRect());
      }
    };
    
    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('menu-open', isMenuOpen);
  }, [isMenuOpen]);

  return (
    <Router>
      <div className="page-wrapper">
        <Navbar isMenuOpen={isMenuOpen} onToggleMenu={toggleMenu} ref={logoRef} />
        
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
        
        <Footer />
      </div>

      <DropdownMenu isOpen={isMenuOpen} onClose={closeMenu} logoPosition={logoPosition} />
    </Router>
  );
}

export default App;