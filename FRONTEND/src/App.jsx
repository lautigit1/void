// En FRONTEND/src/App.jsx

import React, { useState, useEffect, lazy, Suspense, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore.js';
import { v4 as uuidv4 } from 'uuid';

// --- Componentes ---
import Navbar from '@/components/common/Navbar.jsx';
import Footer from '@/components/common/Footer.jsx';
import DropdownMenu from '@/components/common/DropdownMenu.jsx';
import ProtectedRoute from '@/components/common/ProtectedRoute.jsx';
import CartNotificationModal from '@/components/products/CartNotificationModal.jsx';
import CartModal from '@/components/products/CartModal.jsx';
import SearchModal from '@/components/common/SearchModal.jsx';
import Chatbot from '@/components/common/Chatbot.jsx';
import AdminLayout from '@/pages/AdminLayout.jsx';

// --- Páginas (Carga Diferida) ---
const HomePage = lazy(() => import('@/pages/HomePage.jsx'));
const CatalogPage = lazy(() => import('@/pages/CatalogPage.jsx'));
const LoginPage = lazy(() => import('@/pages/LoginPage.jsx'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage.jsx'));
const ProductPage = lazy(() => import('@/pages/ProductPage.jsx'));
const CartPage = lazy(() => import('@/pages/CartPage.jsx'));
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage.jsx'));
const SearchResultsPage = lazy(() => import('@/pages/SearchResultsPage.jsx'));
const PaymentSuccessPage = lazy(() => import('@/pages/PaymentSuccessPage.jsx'));
const PaymentFailurePage = lazy(() => import('@/pages/PaymentFailurePage.jsx'));
const PaymentPendingPage = lazy(() => import('@/pages/PaymentPendingPage.jsx'));
const AdminDashboard = lazy(() => import('@/components/admin/AdminDashboard.jsx'));
const AdminProductsPage = lazy(() => import('@/pages/AdminProductsPage.jsx'));
const AdminProductFormPage = lazy(() => import('@/pages/AdminProductFormPage.jsx'));
const AdminProductVariantsPage = lazy(() => import('@/pages/AdminProductVariantsPage.jsx'));
const AdminOrdersPage = lazy(() => import('@/pages/AdminOrdersPage.jsx'));
const AdminOrderDetailPage = lazy(() => import('@/pages/AdminOrderDetailPage.jsx'));
const AdminUsersPage = lazy(() => import('@/pages/AdminUsersPage.jsx'));


const AppContent = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // --- ¡VOLVEMOS A AGREGAR LA LÓGICA DEL LOGO! ---
  const [logoPosition, setLogoPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const logoRef = useRef(null);
  
  const [isCartNotificationOpen, setIsCartNotificationOpen] = useState(false);
  const [addedItem, setAddedItem] = useState(null); 
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { checkAuth } = useAuthStore();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const handleSetAddedItem = (item) => setAddedItem(item);
  const handleOpenCartModal = () => setIsCartModalOpen(true);
  const handleCloseCartModal = () => setIsCartModalOpen(false);
  const handleOpenSearch = () => setIsSearchOpen(true);
  const handleCloseSearch = () => setIsSearchOpen(false);
  const handleOpenCartNotification = () => setIsCartNotificationOpen(true);
  const handleCloseCartNotification = () => setIsCartNotificationOpen(false);

  useEffect(() => {
    let guestId = localStorage.getItem('guestSessionId');
    if (!guestId) {
      guestId = uuidv4();
      localStorage.setItem('guestSessionId', guestId);
    }
    checkAuth();
  }, [checkAuth]);
  
  // --- ¡ESTE USEEFFECT CALCULA LA POSICIÓN DEL LOGO! ---
  useEffect(() => {
    const updatePosition = () => {
      if (logoRef.current) {
        setLogoPosition(logoRef.current.getBoundingClientRect());
      }
    };
    
    updatePosition(); // Lo calculamos una vez al cargar
    window.addEventListener('resize', updatePosition); // Y lo recalculamos si cambia el tamaño de la ventana
    return () => window.removeEventListener('resize', updatePosition);
  }, []);

  useEffect(() => {
    // Cierra todos los modales al navegar para evitar bugs
    setIsMenuOpen(false);
    setIsCartNotificationOpen(false);
    setIsCartModalOpen(false);
    setIsSearchOpen(false);
    document.body.classList.remove('menu-open');
  }, [location]);

  useEffect(() => {
    // Frena el scroll del fondo si cualquier modal está abierto
    document.body.classList.toggle('menu-open', isMenuOpen || isCartNotificationOpen || isCartModalOpen || isSearchOpen);
  }, [isMenuOpen, isCartNotificationOpen, isCartModalOpen, isSearchOpen]);

  return (
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
          {/* --- Rutas Públicas --- */}
          <Route path="/" element={<HomePage />} />
          <Route path="/catalog/:categoryName" element={<CatalogPage />} />
          <Route 
              path="/product/:productId" 
              element={<ProductPage 
                          onOpenCartModal={handleOpenCartNotification} 
                          onSetAddedItem={handleSetAddedItem}
                      />} 
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<RegisterPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          
          {/* --- Rutas de Estado de Pago --- */}
          <Route path="/payment/success" element={<PaymentSuccessPage />} />
          <Route path="/payment/failure" element={<PaymentFailurePage />} />
          <Route path="/payment/pending" element={<PaymentPendingPage />} />
          
          {/* --- Rutas Protegidas del Admin --- */}
          <Route 
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} /> 
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="products/new" element={<AdminProductFormPage />} />
            <Route path="products/edit/:productId" element={<AdminProductFormPage />} />
            <Route path="products/:productId/variants" element={<AdminProductVariantsPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="orders/:orderId" element={<AdminOrderDetailPage />} />
          </Route>
        </Routes>
      </Suspense>
      
      <Footer />

      {/* Le pasamos la posición al menú para que haga la magia */}
      <DropdownMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} logoPosition={logoPosition} />
      
      {isCartNotificationOpen && (
        <CartNotificationModal 
            item={addedItem} 
            onClose={handleCloseCartNotification}
        />
      )}
      
      {isCartModalOpen && (
          <CartModal isOpen={isCartModalOpen} onClose={handleCloseCartModal} />
      )}

      <SearchModal isOpen={isSearchOpen} onClose={handleCloseSearch} />
      
      <Chatbot />
    </div>
  );
}

// Componente principal que envuelve todo en el Router
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;