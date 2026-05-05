import axios from 'axios';

const API_URL = 'http://localhost:4000/api/auth';

export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    if (response.data.token) {
      localStorage.setItem('fwd_token', response.data.token);
      localStorage.setItem('fwd_user', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || 'Error al iniciar sesión';
  }
};

export const logout = () => {
  localStorage.removeItem('fwd_token');
  localStorage.removeItem('fwd_user');
  window.location.href = '/login';
};

export const getToken = () => localStorage.getItem('fwd_token');

export const getUser = () => JSON.parse(localStorage.getItem('fwd_user'));

export const isAuthenticated = () => !!localStorage.getItem('fwd_token');
