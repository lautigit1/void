import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './style.css' // Importamos los estilos para toda la app

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)