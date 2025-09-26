// En FRONTEND/src/pages/AdminDashboardPage.jsx

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext'; // Usa el nuevo AuthContext
import Spinner from '../components/common/Spinner';
import AdminCharts from '../components/admin/AdminCharts'; // Asumiendo que tienes este componente

const AdminDashboardPage = () => {
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useContext(AuthContext); // Obtiene el token desde el contexto

  useEffect(() => {
    // Función para buscar datos usando el token del contexto
    const fetchKpis = async () => {
      if (!token) {
          setLoading(false);
          setError('No estás autenticado para ver esta información.');
          return;
      }

      setLoading(true);
      try {
        const response = await fetch('http://127.0.0.1:8000/api/admin/metrics/kpis', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'No se pudieron cargar las métricas.');
        }

        const data = await response.json();
        setKpis(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchKpis();
  }, [token]); // El efecto se dispara cuando el token esté disponible

  return (
    <div>
        <h1>Bienvenido al Panel de Administrador</h1>
        <p>Desde acá vas a poder controlar toda la magia de VOID.</p>
        
        {loading && <Spinner message="Cargando métricas..." />}
        {error && <p className="error-message" style={{color: 'red'}}>Error: {error}</p>}
        
        {kpis && (
          <div className="dashboard-widgets">
            <div className="widget">
              <h3>Ingresos Totales</h3>
              <p className="widget-value">${kpis.total_revenue.toLocaleString('es-AR')}</p>
            </div>
            <div className="widget">
              <h3>Ticket Promedio</h3>
              <p className="widget-value">${kpis.average_ticket.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
            </div>
            <div className="widget">
              <h3>Órdenes Totales</h3>
              <p className="widget-value">{kpis.total_orders}</p>
            </div>
             <div className="widget">
              <h3>Usuarios Registrados</h3>
              <p className="widget-value">{kpis.total_users}</p>
            </div>
            <div className="widget">
              <h3>Gastos Totales</h3>
              <p className="widget-value">${kpis.total_expenses.toLocaleString('es-AR')}</p>
            </div>
          </div>
        )}
        <div className="dashboard-charts-section">
          {/* El componente de gráficos también necesitará ser adaptado para usar Context si es necesario */}
          <AdminCharts />
        </div>
    </div>
  );
};

export default AdminDashboardPage;