// En FRONTEND/src/pages/AdminProductVariantsPage.jsx
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProductById, addAdminVariant, deleteAdminVariant } from '@/services/api';
import { useNotify } from '@/context/NotificationContext';

const AdminProductVariantsPage = () => {
  const { productId } = useParams();
  const queryClient = useQueryClient();
  const { notify } = useNotify();

  const [newVariant, setNewVariant] = useState({
    tamanio: '',
    color: '',
    cantidad_en_stock: 0
  });

  const { data: product, isLoading, isError, error } = useQuery({
    queryKey: ['productVariants', productId],
    queryFn: () => getProductById(productId),
  });

  const addMutation = useMutation({
    mutationFn: addAdminVariant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productVariants', productId] });
      setNewVariant({ tamanio: '', color: '', cantidad_en_stock: 0 });
      notify('Variante agregada con éxito', 'success');
    },
    onError: (err) => notify(`Error: ${err.response?.data?.detail || err.message}`, 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminVariant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productVariants', productId] });
      notify('Variante eliminada', 'success');
    },
    onError: (err) => notify(`Error: ${err.response?.data?.detail || err.message}`, 'error'),
  });

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setNewVariant(prev => ({ ...prev, [name]: type === 'number' ? parseInt(value) || 0 : value }));
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    addMutation.mutate({ productId, variantData: newVariant });
  };

  const handleDelete = (variantId) => {
    if (window.confirm('¿Posta querés borrar esta variante?')) {
      deleteMutation.mutate(variantId);
    }
  };

  if (isLoading) return <p>Cargando producto...</p>;
  if (isError) return <p>Error: {error.message}</p>;

  return (
    <div>
      <Link to="/admin/products">&larr; Volver a Productos</Link>
      <div className="admin-header">
        <h1>Gestionar Variantes de "{product?.nombre}"</h1>
      </div>
      
      <h3>Variantes Actuales</h3>
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID Variante</th>
            <th>Talle</th>
            <th>Color</th>
            <th>Stock</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {product?.variantes.map(variant => (
            <tr key={variant.id}>
              <td>{variant.id}</td>
              <td>{variant.tamanio}</td>
              <td>{variant.color}</td>
              <td>{variant.cantidad_en_stock}</td>
              <td className="actions-cell">
                <button 
                  className="action-btn delete"
                  onClick={() => handleDelete(variant.id)}
                  disabled={deleteMutation.isPending}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <form onSubmit={handleAddSubmit} className="admin-form" style={{marginTop: '2rem'}}>
        <h3>Añadir Nueva Variante</h3>
        <div className="form-grid" style={{gridTemplateColumns: '1fr 1fr 1fr auto', alignItems: 'flex-end', gap: '1rem'}}>
            <div className="form-group">
                <label htmlFor="tamanio">Talle</label>
                <input type="text" id="tamanio" name="tamanio" value={newVariant.tamanio} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
                <label htmlFor="color">Color</label>
                <input type="text" id="color" name="color" value={newVariant.color} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
                <label htmlFor="cantidad_en_stock">Stock</label>
                <input type="number" id="cantidad_en_stock" name="cantidad_en_stock" value={newVariant.cantidad_en_stock} onChange={handleInputChange} required />
            </div>
            <button type="submit" className="add-product-btn" style={{marginBottom: 0}} disabled={addMutation.isPending}>
              {addMutation.isPending ? 'Agregando...' : 'Añadir'}
            </button>
        </div>
      </form>
    </div>
  );
};

export default AdminProductVariantsPage;