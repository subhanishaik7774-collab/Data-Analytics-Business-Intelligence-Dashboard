import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Restore session on application load
  useEffect(() => {
    const checkAuthMe = async () => {
      const token = localStorage.getItem('bi_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        setUser(res.data);
      } catch (err) {
        console.warn('Session expired or invalid token.');
        localStorage.removeItem('bi_token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthMe();
  }, []);

  // Login handler
  const login = async (email, password) => {
    setError(null);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user: userData } = res.data;
      
      localStorage.setItem('bi_token', token);
      setUser(userData);
      return userData;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    }
  };

  // Registration handler
  const register = async (email, password, fullName) => {
    setError(null);
    try {
      const res = await api.post('/auth/register', { email, password, fullName });
      const { token, user: userData } = res.data;
      
      localStorage.setItem('bi_token', token);
      setUser(userData);
      return userData;
    } catch (err) {
      setError(err.message || 'Registration failed');
      throw err;
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('bi_token');
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, setError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be wrapped inside an AuthProvider');
  }
  return context;
};
