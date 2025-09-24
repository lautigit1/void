import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios'; // <-- Importar axios

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

// Usamos un interceptor para enviar el token en cada petición
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


export const useAuthStore = create((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,

  // NUEVA FUNCIÓN: Fetching del usuario
  fetchUser: async () => {
    try {
      const response = await api.get('/auth/me'); // <-- Llama al endpoint del backend
      set({ user: response.data });
      return response.data;
    } catch (error) {
      console.error('Error fetching user data:', error);
      // En caso de error, reseteamos el estado
      set({ token: null, user: null, isAuthenticated: false });
      localStorage.removeItem('authToken');
      return null;
    }
  },

  login: async (token) => { // <-- Hacer la función asíncrona
    try {
      localStorage.setItem('authToken', token);
      
      const user = await useAuthStore.getState().fetchUser(); // <-- Usar la nueva función
      if (user) {
        set({ token, isAuthenticated: true });
      } else {
        throw new Error('Could not fetch user data');
      }
      
    } catch (error) {
      console.error("Fallo al decodificar el token o al obtener el usuario:", error);
    }
  },

  logout: () => {
    localStorage.removeItem('authToken');
    set({ token: null, user: null, isAuthenticated: false });
  },

  checkAuth: async () => { // <-- Hacer la función asíncrona
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        if (decodedUser.exp * 1000 > Date.now()) {
          const user = await useAuthStore.getState().fetchUser(); // <-- Usar la nueva función
          if (user) {
            set({ token, isAuthenticated: true });
          }
        } else {
          localStorage.removeItem('authToken');
        }
      } catch (error) {
        localStorage.removeItem('authToken');
      }
    }
  },
}));