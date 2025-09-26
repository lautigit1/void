// En FRONTEND/src/components/admin/AdminDashboard.jsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
// ¡Importamos TODAS las funciones que necesitamos!
import { getAdminKpis, getAdminSalesChart } from '@/services/api'; 
import AdminCharts from './AdminCharts';

const AdminDashboard = () => {
  // Pedimos los KPIs
  const { data: kpis, isLoading: isLoadingKpis, error: errorKpis } = useQuery({
    queryKey: ['adminKpis'],
    queryFn: getAdminKpis,
  });

  // Pedimos los datos para el gráfico
  const { data: salesChartData, isLoading: isLoadingCharts, error: errorCharts } = useQuery({
    queryKey: ['adminSalesChart'],
    queryFn: getAdminSalesChart,
  });

  // Mostramos "cargando" si CUALQUIERA de las dos llamadas está en proceso
  if (isLoadingKpis || isLoadingCharts) {
    return <p>Cargando telemetría...</p>;
  }

  // Si CUALQUIERA de las dos llamadas falló, mostramos un error
  if (errorKpis || errorCharts) {
    return <p className="error-message">Error al cargar las métricas: {errorKpis?.message || errorCharts?.message}</p>;
  }

  return (
    <div>
      <h1>Dashboard de Telemetría</h1>
      <p>Desde acá vas a poder controlar toda la magia de VOID.</p>

      {kpis && (
        <div className="dashboard-widgets">
          <div className="widget">
            <h3>Ingresos Totales</h3>
            <p className="widget-value">${kpis.total_revenue.toLocaleString('es-AR')}</p>
          </div>
          <div className="widget">
            <h3>Ticket Promedio</h3>
            <p className="widget-value">${kpis.average_ticket.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
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
        {/* Le pasamos la data del gráfico como un "prop" */}
        <AdminCharts salesChartData={salesChartData} />
      </div>
    </div>
  );
};

export default AdminDashboard;