// En FRONTEND/src/pages/AdminOrderDetailPage.jsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { getAdminOrderDetail } from '@/services/api';

const AdminOrderDetailPage = () => {
  const { orderId } = useParams();
  
  const { data: order, isLoading, isError, error } = useQuery({
    queryKey: ['adminOrderDetail', orderId],
    queryFn: () => getAdminOrderDetail(orderId),
    enabled: !!orderId, // Solo busca la data si hay un orderId en la URL
  });

  if (isLoading) return <p>Cargando detalles de la orden...</p>;
  if (isError) return <p className="error-message">Error al cargar la orden: {error.message}</p>;
  if (!order) return <p>Orden no encontrada.</p>

  return (
    <div>
      <Link to="/admin/orders">&larr; Volver a Órdenes</Link>
      <div className="admin-header">
        <h1>Detalle de la Orden #{order.id}</h1>
      </div>

      <div className="order-details-summary" style={{ background: '#fff', padding: '1.5rem', marginBottom: '2rem' }}>
        <p><strong>Cliente ID:</strong> {order.usuario_id}</p>
        <p><strong>Fecha:</strong> {new Date(order.creado_en).toLocaleString()}</p>
        <p><strong>Monto Total:</strong> ${parseFloat(order.monto_total).toLocaleString('es-AR')}</p>
        <p><strong>Estado:</strong> {order.estado_pago}</p>
      </div>

      <h3>Productos en esta Orden</h3>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Variante (Talle/Color)</th>
            <th>Cantidad</th>
            <th>Precio Unitario</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {/* Nos aseguramos que 'detalles' exista antes de mapear */}
          {order.detalles?.map(detail => (
            <tr key={detail.variante_producto_id}>
              <td>{detail.variante_producto.producto_nombre}</td>
              <td>{detail.variante_producto.tamanio} / {detail.variante_producto.color}</td>
              <td>{detail.cantidad}</td>
              <td>${parseFloat(detail.precio_en_momento_compra).toLocaleString('es-AR')}</td>
              <td>${(detail.cantidad * detail.precio_en_momento_compra).toLocaleString('es-AR')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminOrderDetailPage;