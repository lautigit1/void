import React from 'react';
import { Link } from 'react-router-dom';

const QuickViewContent = ({ product, onClose }) => {
    if (!product) return null;

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-AR', {
          style: 'currency',
          currency: 'ARS',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(price).replace("ARS", "$").trim();
    };

    return (
        <div className="quick-view-content-wrapper">
            <div className="quick-view-image-container">
                <img src={product.urls_imagenes} alt={product.nombre} />
            </div>
            <div className="quick-view-info">
                <h3 className="quick-view-name">{product.nombre}</h3>
                <p className="quick-view-price">{formatPrice(product.precio)} ARS</p>
                <div className="quick-view-actions">
                    <Link to={`/product/${product.id}`} onClick={onClose} className="quick-view-link-button">
                        VIEW PRODUCT
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default QuickViewContent;