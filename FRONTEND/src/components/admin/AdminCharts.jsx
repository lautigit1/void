// En FRONTEND/src/components/admin/AdminCharts.jsx
import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// ¡CAMBIO CLAVE: Ahora recibe la data como un "prop"!
const AdminCharts = ({ salesChartData }) => {

  // Si no hay datos, no mostramos nada.
  if (!salesChartData || salesChartData.length === 0) {
    return <p>No hay datos de ventas para mostrar en el gráfico.</p>;
  }

  // Preparamos la data para el gráfico
  const chartData = {
    labels: salesChartData.map(d => new Date(d.fecha).toLocaleDateString('es-AR')),
    datasets: [{
      label: 'Ventas por Día',
      data: salesChartData.map(d => d.total),
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.5)',
    }]
  };

  return (
    <div className="admin-charts-container">
      <div className="chart-widget">
        <h3>Evolución de Ventas</h3>
        <Line data={chartData} />
      </div>
    </div>
  );
};

export default AdminCharts;