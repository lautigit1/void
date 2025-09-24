import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'; // <-- Importante: esto permite a Vite entender las rutas

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Esta sección es la que soluciona el problema de raíz
  resolve: {
    alias: {
      // Le decimos a Vite: cuando veas '@', trátalo como la carpeta 'src'
      '@': path.resolve(__dirname, './src'),
    },
  },
});