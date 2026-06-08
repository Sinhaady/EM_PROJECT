import axios from 'axios';
import { getToken } from './token';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getToken() || localStorage.getItem('eventM_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
