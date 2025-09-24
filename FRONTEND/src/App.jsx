import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Componentes comunes
import Navbar from './components/common/Navbar.jsx';
import Footer from './components/common/Footer.jsx';
import DropdownMenu from './components/common/DropdownMenu.jsx';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';

// Layout para el panel de admin
import AdminLayout from './pages/AdminLayout.jsx'; 

// Lazy Loading para las páginas públicas
const HomePage = lazy(() => import('./pages/HomePage.jsx'));
const CatalogPage = lazy(() => import('./pages/CatalogPage.jsx'));
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'));
const RegisterPage = lazy(() => import('./pages/RegisterPage.jsx'));

// Lazy Loading para las secciones del Admin Panel
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard.jsx'));
const ProductManagement = lazy(() => import('./components/admin/ProductManagement.jsx'));
const UserManagement = lazy(() => import('./components/admin/UserManagement.jsx'));
const OrderManagement = lazy(() => import('./components/admin/OrderManagement.jsx'));


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
        
        <Suspense fallback={<div style={{textAlign: 'center', padding: '5rem'}}>Cargando...</div>}>
          <Routes>
            {/* Rutas Públicas */}
            <Route path="/" element={<HomePage />} />
            <Route path="/catalog/:categoryName" element={<CatalogPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<RegisterPage />} />

            {/* Rutas anidadas y protegidas para el Panel de Admin */}
            <Route 
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} /> 
              <Route path="products" element={<ProductManagement />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="orders" element={<OrderManagement />} />
            </Route>
          </Routes>
        </Suspense>
        
        <Footer />
      </div>

      <DropdownMenu isOpen={isMenuOpen} onClose={closeMenu} logoPosition={logoPosition} />
    </Router>
  );
}

export default App;