// En FRONTEND/vite.config.js

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'; // <-- Importante: esto permite a Vite entender las rutas

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // --- ¡AQUÍ ESTÁ LA SOLUCIÓN! ---
  resolve: {
    alias: {
      // Le decimos a Vite: cuando veas '@', trátalo como la carpeta 'src'.
      '@': path.resolve(__dirname, './src'),
    },
  },
});