import axios from 'axios';

const BASE_URL = typeof window !== 'undefined'
  ? `http://${window.location.hostname}:5000/api`
  : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Agregar token JWT automáticamente a cada request
api.interceptors.request.use(config => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('benefits_token') : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export default api;
