import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import FilterPanel from '../components/common/FilterPanel.jsx';

const CatalogPage = () => {
  const { categoryName } = useParams();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('http://localhost:8000/api/products?limit=12');
        setProducts(response.data);
      } catch (error) {
        console.error("Error al cargar los productos del catálogo:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
    window.scrollTo(0, 0); 
  }, [categoryName]);
  
  // Bloquea el scroll del body cuando el panel está abierto
  useEffect(() => {
    document.body.style.overflow = isFilterPanelOpen ? 'hidden' : 'auto';
  }, [isFilterPanelOpen]);

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

        {isLoading ? (
          <p className="loading-text">Cargando productos...</p>
        ) : (
          <div className="catalog-product-grid">
            {products.map(product => (
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
      
      {/* 1. AÑADIMOS EL OVERLAY */}
      <div 
        className={`filter-panel-overlay ${isFilterPanelOpen ? 'open' : ''}`}
        onClick={toggleFilterPanel} 
      ></div>
      
      {/* 2. EL PANEL DE FILTROS SE RENDERIZA POR ENCIMA */}
      <FilterPanel isOpen={isFilterPanelOpen} onClose={toggleFilterPanel} />
    </>
  );
};

export default CatalogPage;