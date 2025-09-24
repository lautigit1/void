import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:8000/api',
});

/* TELEMETRÍA FUTURA:
  Cuando el usuario se loguee, aquí es donde interceptaremos
  las peticiones para añadir el token de autenticación.
  Por ahora, lo dejamos preparado.
*/
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default axiosClient;