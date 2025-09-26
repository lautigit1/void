// En FRONTEND/src/pages/AdminOrdersPage.jsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAdminOrders } from '@/services/api'; // Asegúrate que esta función exista en api.js

const AdminOrdersPage = () => {
  const { data: orders, isLoading, isError, error } = useQuery({
    queryKey: ['adminOrders'],
    queryFn: getAdminOrders,
  });

  if (isLoading) return <p>Cargando órdenes...</p>;
  if (isError) return <p className="error-message">Error al cargar las órdenes: {error.message}</p>;

  return (
    <div>
      <div className="admin-header">
        <h1>Gestión de Órdenes</h1>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID Orden</th>
            <th>ID Usuario</th>
            <th>Monto Total</th>
            <th>Estado Pago</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {orders?.map(order => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td title={order.usuario_id}>{order.usuario_id.slice(0, 8)}...</td>
              <td>${parseFloat(order.monto_total).toLocaleString('es-AR')}</td>
              <td>
                <span className={`status-badge status-${order.estado_pago?.toLowerCase()}`}>
                  {order.estado_pago || 'N/A'}
                </span>
              </td>
              <td>{new Date(order.creado_en).toLocaleDateString('es-AR')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminOrdersPage;