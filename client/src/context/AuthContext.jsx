/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';
import { clearToken, setToken as setApiToken } from '../api/token';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('eventM_token') || null);
  const [isLoading, setIsLoading] = useState(true);

  const storeSession = (newToken, userData) => {
    localStorage.setItem('eventM_token', newToken);
    setApiToken(newToken);
    setToken(newToken);
    setUser(userData);
  };

  const clearSession = () => {
    localStorage.removeItem('eventM_token');
    clearToken();
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        setApiToken(token);
        const response = await api.get('/auth/me');
        setUser(response.data.user);
      } catch (error) {
        console.error('Token invalid or expired', error);
        clearSession();
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      storeSession(response.data.token, response.data.user);
      return null;
    } catch (error) {
      return error.response?.data?.message || 'Unable to log in. Please try again.';
    }
  };

  const register = async (name, email, password, role) => {
    try {
      const response = await api.post('/auth/register', { name, email, password, role });
      storeSession(response.data.token, response.data.user);
      return null;
    } catch (error) {
      return error.response?.data?.message || 'Unable to create account. Please try again.';
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await api.post('/auth/logout');
      }
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      clearSession();
    }
  };

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#090b12',
          color: '#f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
