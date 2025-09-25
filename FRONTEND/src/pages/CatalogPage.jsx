// En FRONTEND/src/pages/CatalogPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import FilterPanel from '@/components/common/FilterPanel.jsx'; // <-- RUTA CORREGIDA CON ALIAS
import QuickViewModal from '@/components/products/QuickViewModal.jsx'; // <-- RUTA CORREGIDA CON ALIAS
import { getProducts } from '@/services/api'; // <-- RUTA CORREGIDA CON ALIAS

// Componente placeholder para una carga más elegante
const ProductCardSkeleton = () => (
  <div className="catalog-product-card">
    <div className="catalog-product-image-container bg-gray-200 animate-pulse" />
    <div className="catalog-product-info mt-2">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
      <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
    </div>
  </div>
);

const CatalogPage = () => {
    const { categoryName } = useParams();
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Usamos useQuery con nuestra función de servicio centralizada
    const { data: products, isLoading, error } = useQuery({
      queryKey: ['products'],
      queryFn: getProducts,
    });

    useEffect(() => {
        document.body.style.overflow = isFilterPanelOpen || isQuickViewOpen ? 'hidden' : 'auto';
    }, [isFilterPanelOpen, isQuickViewOpen]);
    
    useEffect(() => {
        window.scrollTo(0, 0); 
    }, [categoryName]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-AR', {
          style: 'currency',
          currency: 'ARS',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(price).replace("ARS", "$").trim();
    };

    const toggleFilterPanel = () => {
        setIsFilterPanelOpen(!isFilterPanelOpen);
    };
    
    const handleProductClick = (product) => {
        setSelectedProduct(product);
        setIsQuickViewOpen(true);
    };
    
    const handleCloseModal = () => {
        setIsQuickViewOpen(false);
        setSelectedProduct(null);
    };

    return (
        <>
            <main className="catalog-container">
                <div className="catalog-header">
                    <h1 className="catalog-title">{categoryName.replace('-', ' ')}</h1>
                    <button onClick={toggleFilterPanel} className="filters-link">FILTERS &gt;</button>
                </div>

                {isLoading ? (
                  <div className="catalog-product-grid">
                      {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
                  </div>
                ) : error ? (
                  <p className="loading-text">Error al cargar los productos.</p>
                ) : (
                  <div className="catalog-product-grid">
                      {products.map(product => (
                          <div 
                              className="catalog-product-card" 
                              key={product.id}
                              onClick={() => handleProductClick(product)}
                          >
                              <div className="catalog-product-link">
                                  <div className="catalog-product-image-container">
                                      <img 
                                          src={product.urls_imagenes || '/img/placeholder.jpg'} 
                                          alt={product.nombre} 
                                          className="catalog-product-image"
                                      />
                                  </div>
                                  <div className="catalog-product-info">
                                      <h3 className="catalog-product-name">{product.nombre}</h3>
                                      <p className="catalog-product-price">{formatPrice(product.precio)}</p>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
                )}
                
                <nav className="pagination-controls">
                    <a href="#" className="pagination-arrow">&lt; PREVIOUS</a>
                    <a href="#" className="pagination-number active">1</a>
                    <a href="#" className="pagination-number">2</a>
                    <a href="#" className="pagination-number">3</a>
                    <a href="#" className="pagination-number">4</a>
                    <a href="#" className="pagination-number">5</a>
                    <a href="#" className="pagination-arrow">NEXT &gt;</a>
                </nav>
            </main>
            
            <div 
                className={`filter-panel-overlay ${isFilterPanelOpen ? 'open' : ''}`}
                onClick={toggleFilterPanel} 
            ></div>
            
            <FilterPanel isOpen={isFilterPanelOpen} onClose={toggleFilterPanel} />
            
            {isQuickViewOpen && selectedProduct && (
                <QuickViewModal product={selectedProduct} onClose={handleCloseModal} />
            )}
        </>
    );
};

export default CatalogPage;