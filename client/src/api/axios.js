import axios from 'axios';
import { clearToken, getToken, setToken } from './token';

export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

let refreshRequest = null;

api.interceptors.request.use((config) => {
  const token = getToken() || localStorage.getItem('eventM_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

const refreshAccessToken = async () => {
  refreshRequest ??= axios
    .post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true })
    .then((response) => {
      const newToken = response.data.token;

      if (newToken) {
        localStorage.setItem('eventM_token', newToken);
        setToken(newToken);
        window.dispatchEvent(new CustomEvent('auth:token-refreshed', { detail: newToken }));
      }

      return newToken;
    })
    .finally(() => {
      refreshRequest = null;
    });

  return refreshRequest;
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const requestUrl = originalRequest?.url || '';
    const isAuthRequest =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/register') ||
      requestUrl.includes('/auth/refresh');

    if (status !== 401 || !originalRequest || originalRequest._retry || isAuthRequest) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const newToken = await refreshAccessToken();

      if (!newToken) {
        throw new Error('Refresh did not return a token');
      }

      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      localStorage.removeItem('eventM_token');
      clearToken();
      window.dispatchEvent(new Event('auth:session-expired'));
      return Promise.reject(refreshError);
    }
  },
);

export default api;
