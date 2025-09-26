// En FRONTEND/src/components/common/FilterPanel.jsx
import React, { useState } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

const FilterPanel = ({ isOpen, onClose }) => {
  const [priceRange, setPriceRange] = useState([16000, 150000]);
  const minPrice = 0;
  const maxPrice = 200000;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price).replace("ARS", "").trim();
  };

  return (
    <div className={`filter-panel ${isOpen ? 'open' : ''}`}>
      <div className="filter-panel-header">
        <h2 className="filter-panel-title">FILTERS</h2>
        <button className="filter-panel-close-btn" onClick={onClose}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L17 17M17 1L1 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      <div className="filter-panel-content">
        {/* Gender Filter */}
        <div className="filter-section">
          <div className="filter-section-header">
            <span className="filter-section-title">GENDER</span>
            <span className="filter-section-arrow">&gt;</span>
          </div>
        </div>

        {/* Category Filter */}
        <div className="filter-section">
          <div className="filter-section-header">
            <span className="filter-section-title">CATEGORY</span>
            <span className="filter-section-arrow">&gt;</span>
          </div>
        </div>

        {/* Size Filter */}
        <div className="filter-section active">
          <div className="filter-section-header">
            <span className="filter-section-title">SIZE</span>
            <span className="filter-section-arrow">&#8964;</span>
          </div>
          <div className="filter-section-body">
            <label className="checkbox-container"><input type="checkbox" name="size" value="XS" /> XS<span className="checkmark"></span></label>
            <label className="checkbox-container"><input type="checkbox" name="size" value="S" /> S<span className="checkmark"></span></label>
            <label className="checkbox-container"><input type="checkbox" name="size" value="M" /> M<span className="checkmark"></span></label>
            <label className="checkbox-container"><input type="checkbox" name="size" value="L" /> L<span className="checkmark"></span></label>
            <label className="checkbox-container"><input type="checkbox" name="size" value="XL" /> XL<span className="checkmark"></span></label>
            <label className="checkbox-container"><input type="checkbox" name="size" value="XXL" /> XXL<span className="checkmark"></span></label>
          </div>
        </div>

        {/* Price Filter */}
        <div className="filter-section active">
          <div className="filter-section-header">
            <span className="filter-section-title">PRICE</span>
          </div>
          <div className="filter-section-body price-filter-body">
            <div className="price-display">
              <span className="price-value">{formatPrice(priceRange[0])} ARS</span>
              <span className="price-separator">-</span>
              <span className="price-value">{formatPrice(priceRange[1])} ARS</span>
            </div>
            <Slider
              range
              min={minPrice}
              max={maxPrice}
              step={1000}
              defaultValue={priceRange}
              onChangeComplete={setPriceRange} /* ¡ARREGLADO! */
              trackStyle={[{ backgroundColor: 'black', height: 2 }]}
              handleStyle={[{ backgroundColor: 'black', borderColor: 'black', height: 10, width: 10, marginTop: -4, boxShadow: 'none' }, { backgroundColor: 'black', borderColor: 'black', height: 10, width: 10, marginTop: -4, boxShadow: 'none'}]}
              railStyle={{ backgroundColor: '#ccc', height: 2 }}
            />
          </div>
        </div>

        {/* Color Filter */}
        <div className="filter-section">
          <div className="filter-section-header">
            <span className="filter-section-title">COLOR</span>
            <span className="filter-section-arrow">&gt;</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;