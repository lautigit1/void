// En FRONTEND/src/pages/SearchResultsPage.jsx
import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { searchProducts } from '@/services/api';

const SearchResultsPage = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');

    const { data: products, isLoading, error } = useQuery({
        queryKey: ['searchResults', query],
        queryFn: () => searchProducts(query),
        enabled: !!query, // Solo ejecuta la query si hay un término de búsqueda
    });

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-AR', {
          style: 'currency',
          currency: 'ARS',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(price).replace("ARS", "$").trim();
    };

    return (
        <main className="catalog-container">
            <div className="catalog-header">
                <h1 className="catalog-title">SEARCH RESULTS FOR: "{query}"</h1>
            </div>

            {isLoading && <p className="loading-text">Buscando...</p>}
            {error && <p className="loading-text">Error al buscar productos.</p>}
            
            {!isLoading && !error && products?.length === 0 && (
                <p className="loading-text">No se encontraron productos para tu búsqueda.</p>
            )}

            {products && products.length > 0 && (
                <div className="catalog-product-grid">
                    {products.map(product => (
                        <Link to={`/product/${product.id}`} className="catalog-product-card" key={product.id}>
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
                    ))}
                </div>
            )}
        </main>
    );
};

export default SearchResultsPage;