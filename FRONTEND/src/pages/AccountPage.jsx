// En FRONTEND/src/pages/AccountPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Spinner from '../components/common/Spinner';

const AccountPage = () => {
  const { user, token, logout } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!token) return;
      try {
        const response = await fetch('http://127.0.0.1:8000/api/checkout/my-orders', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('No se pudieron cargar tus órdenes.');
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [token]);

  return (
    <div className="account-page-container">
      <h1>Mi Cuenta</h1>
      <div className="account-content">
        <aside className="account-sidebar">
          <h3>Hola, {user?.name}</h3>
          <p>{user?.email}</p>
          <button onClick={logout} className="logout-button">Cerrar Sesión</button>
        </aside>
        <main className="account-main">
          <h2>Mi Historial de Compras</h2>
          {loading ? <Spinner message="Cargando historial..." /> : (
            orders.length > 0 ? (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID Orden</th>
                    <th>Fecha</th>
                    <th>Total</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{new Date(order.creado_en).toLocaleDateString()}</td>
                      <td>${order.monto_total}</td>
                      <td>{order.estado_pago}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p>Todavía no hiciste ninguna compra. ¿Qué estás esperando?</p>
          )}
        </main>
      </div>
    </div>
  );
};

export default AccountPage;