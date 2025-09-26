// En FRONTEND/src/pages/CatalogPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import FilterPanel from '@/components/common/FilterPanel.jsx';
import QuickViewModal from '@/components/products/QuickViewModal.jsx';
import Spinner from '@/components/common/Spinner.jsx'; // Usamos el Spinner

// Función helper para obtener la URL de la imagen de forma segura
const getImageUrl = (urls_imagenes) => {
  if (!urls_imagenes) return '/img/placeholder.jpg';
  if (typeof urls_imagenes === 'string' && urls_imagenes.startsWith('["')) {
    try {
      const parsedUrls = JSON.parse(urls_imagenes);
      return parsedUrls[0] || '/img/placeholder.jpg';
    } catch (e) { return '/img/placeholder.jpg'; }
  }
  // Si ya es una URL directa (como en los productos más nuevos), la usamos
  if (Array.isArray(urls_imagenes) && urls_imagenes.length > 0) {
      return urls_imagenes[0];
  }
  return '/img/placeholder.jpg';
};

const ProductCardSkeleton = () => (
  <div className="catalog-product-card">
    <div className="catalog-product-image-container bg-gray-200 animate-pulse" style={{ backgroundColor: '#f0f0f0', animation: 'pulse 1.5s infinite' }} />
    <div className="catalog-product-info mt-2">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" style={{ height: '1rem', backgroundColor: '#e0e0e0', animation: 'pulse 1.5s infinite' }} />
      <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" style={{ height: '1rem', backgroundColor: '#e0e0e0', animation: 'pulse 1.5s infinite' }} />
    </div>
  </div>
);

const CatalogPage = () => {
    const { categoryName } = useParams();
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    
    // --- ¡CAMBIO CLAVE! Se reemplaza useQuery por useState y useEffect ---
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Lógica de fetch similar a las otras páginas
                const response = await fetch(`http://127.0.0.1:8000/api/products?limit=100&category=${categoryName || ''}`);
                if (!response.ok) {
                    throw new Error('No se pudieron cargar los productos');
                }
                const data = await response.json();
                setProducts(Array.isArray(data) ? data : []);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
        window.scrollTo(0, 0);
    }, [categoryName]); // Se ejecuta cada vez que cambia la categoría en la URL

    useEffect(() => {
        document.body.style.overflow = isFilterPanelOpen || isQuickViewOpen ? 'hidden' : 'auto';
    }, [isFilterPanelOpen, isQuickViewOpen]);

    const formatPrice = (price) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price).replace("ARS", "$").trim();
    const toggleFilterPanel = () => setIsFilterPanelOpen(!isFilterPanelOpen);
    
    const handleProductClick = (product, e) => {
        // Evitamos que el Link se active si hacemos click en el botón de quick view
        if (e.target.closest('.quick-view-btn')) {
            e.preventDefault();
            setSelectedProduct(product);
            setIsQuickViewOpen(true);
        }
    };

    const handleCloseModal = () => {
        setIsQuickViewOpen(false);
        setSelectedProduct(null);
    };

    return (
        <>
            <main className="catalog-container">
                <div className="catalog-header">
                    <h1 className="catalog-title">{categoryName?.replace('-', ' ') || 'CATÁLOGO'}</h1>
                    <button onClick={toggleFilterPanel} className="filters-link">FILTERS &gt;</button>
                </div>

                {isLoading ? (
                  <div className="catalog-product-grid">
                      {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
                  </div>
                ) : error ? (
                  <p className="loading-text">{error}</p>
                ) : (
                  <div className="catalog-product-grid">
                      {products.map(product => (
                          <div className="catalog-product-card" key={product.id}>
                              <Link to={`/product/${product.id}`} className="catalog-product-link" onClick={(e) => handleProductClick(product, e)}>
                                  <div className="catalog-product-image-container">
                                      <img src={getImageUrl(product.urls_imagenes)} alt={product.nombre} className="catalog-product-image"/>
                                  </div>
                                  <div className="catalog-product-info">
                                      <h3 className="catalog-product-name">{product.nombre}</h3>
                                      <p className="catalog-product-price">{formatPrice(product.precio)}</p>
                                  </div>
                              </Link>
                          </div>
                      ))}
                  </div>
                )}
            </main>
            
            <div className={`filter-panel-overlay ${isFilterPanelOpen ? 'open' : ''}`} onClick={toggleFilterPanel} />
            <FilterPanel isOpen={isFilterPanelOpen} onClose={toggleFilterPanel} />
            {isQuickViewOpen && selectedProduct && <QuickViewModal product={selectedProduct} onClose={handleCloseModal} />}
        </>
    );
};

export default CatalogPage;