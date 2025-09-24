import React from 'react';
// FIX: Importamos el nuevo componente de contenido del modal
import QuickViewContent from './QuickViewContent.jsx';

const QuickViewModal = ({ product, onClose }) => {
    if (!product) return null;

    return (
        <div className="quick-view-overlay" onClick={onClose}>
            <div className="quick-view-modal-content" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="product-modal-close-btn">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L17 17M17 1L1 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                </button>
                {/* FIX: Usamos el componente QuickViewContent aquí */}
                <QuickViewContent product={product} onClose={onClose} />
            </div>
        </div>
    );
};

export default QuickViewModal;