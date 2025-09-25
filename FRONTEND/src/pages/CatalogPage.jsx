// En FRONTEND/src/pages/CatalogPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import FilterPanel from '@/components/common/FilterPanel.jsx';
import QuickViewModal from '@/components/products/QuickViewModal.jsx';
import { getProducts } from '@/services/api';

// --- FUNCIÓN CLAVE: La Solución Definitiva ---
// Esta función extrae la primera URL válida, sin importar el formato.
const getImageUrl = (urls_imagenes) => {
  if (!urls_imagenes) {
    return '/img/placeholder.jpg'; // Imagen por defecto si no hay nada
  }
  // Si es una cadena que parece un array JSON, la procesamos
  if (typeof urls_imagenes === 'string' && urls_imagenes.startsWith('["')) {
    try {
      const parsedUrls = JSON.parse(urls_imagenes);
      return parsedUrls[0] || '/img/placeholder.jpg'; // Devolvemos la primera URL de la lista
    } catch (e) {
      return '/img/placeholder.jpg'; // Si falla el parseo, imagen por defecto
    }
  }
  // Si ya es una URL normal, la devolvemos directamente
  return urls_imagenes;
};

// Componente placeholder (sin cambios)
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

    const toggleFilterPanel = () => setIsFilterPanelOpen(!isFilterPanelOpen);
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
                                          // --- ¡AQUÍ USAMOS LA NUEVA FUNCIÓN! ---
                                          src={getImageUrl(product.urls_imagenes)} 
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
                    {/* ... (código de paginación sin cambios) ... */}
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