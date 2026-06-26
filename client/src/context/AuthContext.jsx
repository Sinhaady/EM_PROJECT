/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '../api/axios';
import { clearToken, setToken as setApiToken } from '../api/token';

const AuthContext = createContext(null);
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

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
        try {
          const response = await api.get('/auth/me');
          setUser(response.data.user);
        } catch {
          clearSession();
        } finally {
          setIsLoading(false);
        }
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

  const refreshUser = useCallback(async () => {
    const response = await api.get('/auth/me');
    setUser(response.data.user);
    return response.data.user;
  }, []);

  const register = async (name, email, password, role) => {
    try {
      const response = await api.post('/auth/register', { name, email, password, role });
      storeSession(response.data.token, response.data.user);
      await refreshUser();
      return null;
    } catch (error) {
      return error.response?.data?.message || 'Unable to create account. Please try again.';
    }
  };

  const loginWithGoogle = () => {
    window.location.assign(`${API_BASE_URL}/auth/google`);
  };

  const completeGoogleLogin = async (newToken) => {
    if (!newToken) {
      return 'Google login did not return a session token.';
    }

    try {
      localStorage.setItem('eventM_token', newToken);
      setApiToken(newToken);
      const response = await api.get('/auth/me');
      storeSession(newToken, response.data.user);
      return null;
    } catch (error) {
      clearSession();
      return error.response?.data?.message || 'Unable to complete Google login.';
    }
  };

  const logout = async () => {
    try {
      if (token || user) {
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
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        refreshUser,
        loginWithGoogle,
        completeGoogleLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
