// En FRONTEND/src/services/api.js
import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:8000/api',
});

// Interceptor para añadir el token o el guest ID
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    const guestId = localStorage.getItem('guestSessionId');
    if (guestId) {
        config.headers['X-Guest-Session-ID'] = guestId;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// --- Funciones del Servicio de API ---

// Productos
export const getProducts = () => axiosClient.get('/products').then(res => res.data);
export const getProductById = (id) => axiosClient.get(`/products/${id}`).then(res => res.data);
export const searchProducts = (query) => axiosClient.get(`/products/search?q=${query}`).then(res => res.data);

// Autenticación
export const loginUser = (formData) => axiosClient.post('/auth/login', formData, {
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
}).then(res => res.data);

export const registerUser = (payload) => axiosClient.post('/auth/register', payload).then(res => res.data);

// Carrito
export const getCart = () => axiosClient.get('/cart/').then(res => res.data);
export const addItemToCart = (item) => axiosClient.post('/cart/items', item).then(res => res.data);
export const removeItemFromCart = (variante_id) => axiosClient.delete(`/cart/items/${variante_id}`).then(res => res.data);

// Métricas de Admin
export const getAdminKpis = () => axiosClient.get('/admin/metrics/kpis').then(res => res.data);

// Chatbot
export const postChatQuery = (payload) => axiosClient.post('/chatbot/query', payload).then(res => res.data);