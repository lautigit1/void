// En FRONTEND/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.jsx';
import './style.css';
import { NotificationProvider } from './context/NotificationContext.jsx'; // <-- IMPORTAR

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <NotificationProvider> {/* <-- ENVOLVER LA APP */}
        <App />
      </NotificationProvider>
    </QueryClientProvider>
  </React.StrictMode>
);