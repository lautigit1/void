import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/common/Navbar.jsx'; // Se importa como Navbar
import Footer from './components/common/Footer.jsx';
import DropdownMenu from './components/common/DropdownMenu.jsx';
import HomePage from './pages/HomePage.jsx';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
  }, [isMenuOpen]);

  return (
    <Router>
      <div className="page-wrapper">
        <Navbar isMenuOpen={isMenuOpen} onToggleMenu={toggleMenu} /> {/* Se usa como Navbar */}
        
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
        
        <Footer />
      </div>

      <DropdownMenu isOpen={isMenuOpen} onClose={closeMenu} />
    </Router>
  );
}

export default App;