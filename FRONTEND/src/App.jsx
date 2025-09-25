import React, { useState, useEffect, lazy, Suspense, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './stores/useAuthStore.js';
import { v4 as uuidv4 } from 'uuid'; 

// Componentes comunes
import Navbar from './components/common/Navbar.jsx';
import Footer from './components/common/Footer.jsx';
import DropdownMenu from './components/common/DropdownMenu.jsx';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';
import CartNotificationModal from './components/products/CartNotificationModal.jsx';
import CartModal from './components/products/CartModal.jsx';

// Layout para el panel de admin
import AdminLayout from './pages/AdminLayout.jsx'; 

// Lazy Loading para las páginas públicas
const HomePage = lazy(() => import('./pages/HomePage.jsx'));
const CatalogPage = lazy(() => import('./pages/CatalogPage.jsx'));
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'));
const RegisterPage = lazy(() => import('./pages/RegisterPage.jsx'));
const ProductPage = lazy(() => import('./pages/ProductPage.jsx'));
const CartPage = lazy(() => import('./pages/CartPage.jsx'));

// Lazy Loading para las secciones del Admin Panel
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard.jsx'));
const ProductManagement = lazy(() => import('./components/admin/ProductManagement.jsx'));
const UserManagement = lazy(() => import('./components/admin/UserManagement.jsx'));
const OrderManagement = lazy(() => import('./components/admin/OrderManagement.jsx'));

const queryClient = new QueryClient();

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logoPosition, setLogoPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const logoRef = useRef(null);
  const [isCartNotificationOpen, setIsCartNotificationOpen] = useState(false);
  const [addedProduct, setAddedProduct] = useState(null);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);

  const { checkAuth } = useAuthStore();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);
  const handleOpenCartNotification = () => setIsCartNotificationOpen(true);
  const handleCloseCartNotification = () => setIsCartNotificationOpen(false);
  const handleSetAddedProduct = (product) => setAddedProduct(product);
  const handleOpenCartModal = () => setIsCartModalOpen(true);
  const handleCloseCartModal = () => setIsCartModalOpen(false);

  useEffect(() => {
    let guestId = localStorage.getItem('guestSessionId');
    if (!guestId) {
      guestId = uuidv4();
      localStorage.setItem('guestSessionId', guestId);
    }
    checkAuth();
  }, [checkAuth]);
  
  useEffect(() => {
    if (logoRef.current) {
        setLogoPosition(logoRef.current.getBoundingClientRect());
    }
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
    document.body.classList.toggle('menu-open', isMenuOpen || isCartNotificationOpen || isCartModalOpen);
  }, [isMenuOpen, isCartNotificationOpen, isCartModalOpen]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="page-wrapper">
          <Navbar 
            isMenuOpen={isMenuOpen} 
            onToggleMenu={toggleMenu} 
            onOpenCart={handleOpenCartModal} 
            ref={logoRef} 
          />
          
          <Suspense fallback={<div style={{textAlign: 'center', padding: '5rem'}}>Cargando...</div>}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/catalog/:categoryName" element={<CatalogPage />} />
              <Route 
                  path="/product/:productId" 
                  element={<ProductPage 
                              onOpenCartModal={handleOpenCartNotification} 
                              onSetAddedProduct={handleSetAddedProduct}
                          />} 
              />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<RegisterPage />} />
              <Route path="/cart" element={<CartPage />} />
              
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
        
        {isCartNotificationOpen && (
          <CartNotificationModal 
              product={addedProduct} 
              onClose={handleCloseCartNotification}
          />
        )}
        
        {isCartModalOpen && (
            <CartModal isOpen={isCartModalOpen} onClose={handleCloseCartModal} />
        )}
      </Router>
    </QueryClientProvider>
  );
}

export default App;