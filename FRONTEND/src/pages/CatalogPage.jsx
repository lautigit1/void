import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query'; // <-- La mejora
import axios from 'axios'; // <-- Se queda aquí, seguro
import FilterPanel from '../components/common/FilterPanel.jsx';

// La función de fetching se queda dentro del mismo archivo
const fetchProducts = async (categoryName) => {
  const { data } = await axios.get('http://localhost:8000/api/products?limit=12');
  return data;
};

// Componente placeholder para la grilla (para una carga más elegante)
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

  // La magia de React Query, reemplaza el useEffect y los useState de carga
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products', categoryName],
    queryFn: () => fetchProducts(categoryName),
  });

  // El resto del código no cambia...
  useEffect(() => {
    document.body.style.overflow = isFilterPanelOpen ? 'hidden' : 'auto';
  }, [isFilterPanelOpen]);
  
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

  return (
    <>
      <main className="catalog-container">
        <div className="catalog-header">
          <h1 className="catalog-title">{categoryName.replace('-', ' ')}</h1>
          <button onClick={toggleFilterPanel} className="filters-link">FILTERS &gt;</button>
        </div>

        {error ? (
          <p className="loading-text">Error al cargar los productos.</p>
        ) : (
          <div className="catalog-product-grid">
            {isLoading
              ? Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)
              // Si está cargando, muestra los placeholders
              : products.map(product => (
                  <div className="catalog-product-card" key={product.id}>
                    <Link to={`/product/${product.id}`} className="catalog-product-link">
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
                    </Link>
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
    </>
  );
};

export default CatalogPage;