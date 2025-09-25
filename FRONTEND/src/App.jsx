// En FRONTEND/src/App.jsx
import React, { useState, useEffect, lazy, Suspense, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// Se eliminaron las importaciones de 'QueryClient' y 'QueryClientProvider' de este archivo.
import { useAuthStore } from '@/stores/useAuthStore.js';
import { v4 as uuidv4 } from 'uuid'; 

// Componentes comunes
import Navbar from '@/components/common/Navbar.jsx';
import Footer from '@/components/common/Footer.jsx';
import DropdownMenu from '@/components/common/DropdownMenu.jsx';
import ProtectedRoute from '@/components/common/ProtectedRoute.jsx';
import CartNotificationModal from '@/components/products/CartNotificationModal.jsx';
import CartModal from '@/components/products/CartModal.jsx';
import SearchModal from '@/components/common/SearchModal.jsx';
import Chatbot from '@/components/common/Chatbot.jsx';

// Layout para el panel de admin
import AdminLayout from '@/pages/AdminLayout.jsx'; 

// Lazy Loading para las páginas públicas
const HomePage = lazy(() => import('@/pages/HomePage.jsx'));
const CatalogPage = lazy(() => import('@/pages/CatalogPage.jsx'));
const LoginPage = lazy(() => import('@/pages/LoginPage.jsx'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage.jsx'));
const ProductPage = lazy(() => import('@/pages/ProductPage.jsx'));
const CartPage = lazy(() => import('@/pages/CartPage.jsx'));
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage.jsx'));
const SearchResultsPage = lazy(() => import('@/pages/SearchResultsPage.jsx'));

// Lazy Loading para las secciones del Admin Panel
const AdminDashboard = lazy(() => import('@/components/admin/AdminDashboard.jsx'));
const ProductManagement = lazy(() => import('@/components/admin/ProductManagement.jsx'));
const UserManagement = lazy(() => import('@/components/admin/UserManagement.jsx'));
const OrderManagement = lazy(() => import('@/components/admin/OrderManagement.jsx'));

// Se eliminó la creación del 'queryClient' de este archivo.

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logoPosition, setLogoPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const logoRef = useRef(null);
  const [isCartNotificationOpen, setIsCartNotificationOpen] = useState(false);
  const [addedProduct, setAddedProduct] = useState(null);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const { checkAuth } = useAuthStore();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);
  const handleOpenCartNotification = () => setIsCartNotificationOpen(true);
  const handleCloseCartNotification = () => setIsCartNotificationOpen(false);
  const handleSetAddedProduct = (product) => setAddedProduct(product);
  const handleOpenCartModal = () => setIsCartModalOpen(true);
  const handleCloseCartModal = () => setIsCartModalOpen(false);
  const handleOpenSearch = () => setIsSearchOpen(true);
  const handleCloseSearch = () => setIsSearchOpen(false);

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
    document.body.classList.toggle('menu-open', isMenuOpen || isCartNotificationOpen || isCartModalOpen || isSearchOpen);
  }, [isMenuOpen, isCartNotificationOpen, isCartModalOpen, isSearchOpen]);

  // Se ha eliminado el QueryClientProvider que envolvía al Router
  return (
    <Router>
      <div className="page-wrapper">
        <Navbar 
          isMenuOpen={isMenuOpen} 
          onToggleMenu={toggleMenu} 
          onOpenCart={handleOpenCartModal} 
          onOpenSearch={handleOpenSearch}
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
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/search" element={<SearchResultsPage />} />
            
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

      <SearchModal isOpen={isSearchOpen} onClose={handleCloseSearch} />
      
      <Chatbot />
    </Router>
  );
}

export default App;