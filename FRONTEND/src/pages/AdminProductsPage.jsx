// En FRONTEND/src/pages/AdminProductsPage.jsx
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getProducts, deleteAdminProduct } from '@/services/api';
import { useNotify } from '@/context/NotificationContext';

const AdminProductsPage = () => {
  const queryClient = useQueryClient();
  const { notify } = useNotify();

  const { data: products, isLoading, isError, error } = useQuery({
    queryKey: ['adminProducts'],
    queryFn: () => getProducts(100),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      notify('Producto eliminado', 'success');
    },
    onError: (err) => notify(`Error al borrar: ${err.response?.data?.detail || err.message}`, 'error'),
  });

  const handleDelete = (productId) => {
    if (window.confirm('¿Posta querés borrar este producto? No hay vuelta atrás.')) {
      deleteMutation.mutate(productId);
    }
  };

  if (isLoading) return <p>Cargando inventario...</p>;
  if (isError) return <p className="error-message">Error al cargar productos: {error.message}</p>;

  return (
    <div>
      <div className="admin-header">
        <h1>Gestión de Productos</h1>
        <Link to="/admin/products/new" className="add-product-btn">Añadir Producto</Link>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Precio</th>
            <th>SKU</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products?.map(product => (
            <tr key={product.id}>
              <td>{product.id}</td>
              <td>{product.nombre}</td>
              <td>${product.precio}</td>
              <td>{product.sku}</td>
              <td className="actions-cell">
                <Link to={`/admin/products/edit/${product.id}`} className="action-btn edit">Editar</Link>
                <Link to={`/admin/products/${product.id}/variants`} className="action-btn variants">Variantes</Link>
                <button onClick={() => handleDelete(product.id)} className="action-btn delete" disabled={deleteMutation.isPending}>
                  {deleteMutation.isPending ? '...' : 'Eliminar'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminProductsPage;