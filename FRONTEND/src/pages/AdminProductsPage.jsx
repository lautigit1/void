// En FRONTEND/src/pages/AdminProductsPage.jsx

import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import Spinner from '../components/common/Spinner';

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useContext(AuthContext);
  const { notify } = useContext(NotificationContext);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      try {
        const response = await fetch('http://127.0.0.1:8000/api/products?limit=100'); // No necesita token para ver productos
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'No se pudieron cargar los productos.');
        }

        const data = await response.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [token]);

  const handleDelete = async (productId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este producto de forma permanente?')) {
      return;
    }
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/products/${productId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}` // El borrado sí necesita token
        }
      });

      if (response.ok) {
        setProducts(products.filter(p => p.id !== productId));
        notify('Producto eliminado con éxito.', 'success');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'No se pudo eliminar el producto.');
      }
    } catch (err) {
      notify(`Error: ${err.message}`, 'error');
    }
  };

  if (loading) return <Spinner message="Cargando inventario..." />;

  return (
    <div>
      <div className="admin-header">
        <h1>Gestión de Productos</h1>
        <Link to="/admin/products/new" className="add-product-btn">Añadir Producto</Link>
      </div>

      {error && <h2 className="error-message" style={{marginBottom: '1rem', color: 'red'}}>{error}</h2>}
      
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Stock (Variantes)</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.length > 0 ? (
            products.map(product => {
              const totalStockFromVariants = (product.variantes || []).reduce(
                (sum, variant) => sum + variant.cantidad_en_stock, 0
              );

              return (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>{product.nombre}</td>
                  <td>${product.precio}</td>
                  <td>{totalStockFromVariants}</td>
                  <td className="actions-cell">
                    <Link to={`/admin/products/edit/${product.id}`} className="action-btn edit">Editar</Link>
                    <Link to={`/admin/products/${product.id}/variants`} className="action-btn variants">Variantes</Link>
                    <button 
                      className="action-btn delete" 
                      onClick={() => handleDelete(product.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center' }}>No hay productos para mostrar.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminProductsPage;