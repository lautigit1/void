// En FRONTEND/src/context/NotificationContext.jsx
import React, { createContext, useState, useCallback, useContext } from 'react';
import Toast from '@/components/common/Toast.jsx';

// Creamos el contexto
const NotificationContext = createContext(null);

// Un hook custom para que sea más fácil usarlo
export const useNotify = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotify debe ser usado dentro de un NotificationProvider");
    }
    return context;
};

// El proveedor que va a envolver la app
export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState({ message: null, type: '' });

  // La función mágica para llamar a la notificación desde cualquier componente
  const notify = useCallback((message, type = 'success') => {
    setNotification({ message, type });
  }, []);

  // Función para limpiar la notificación una vez que desaparece
  const handleDone = () => {
    setNotification({ message: null, type: '' });
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <Toast 
        message={notification.message} 
        type={notification.type} 
        onDone={handleDone} 
      />
    </NotificationContext.Provider>
  );
};