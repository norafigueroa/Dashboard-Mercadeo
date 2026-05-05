import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/api'
});

// Interceptor para añadir el token a todas las peticiones
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fwd_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor para manejar errores de autenticación (ej. token expirado)
api.interceptors.response.use((response) => response, (error) => {
  if (error.response && error.response.status === 401) {
    localStorage.removeItem('fwd_token');
    localStorage.removeItem('fwd_user');
    window.location.href = '/login';
  }
  return Promise.reject(error);
});

export default api;
