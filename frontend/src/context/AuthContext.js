import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext();

const DEFAULT_USER = {
  id: 'usr-default',
  name: 'Aarav Patel',
  email: 'aarav112006@gmail.com',
  phone: '+91 6351170031',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
  savedAddresses: [
    { id: 'addr-1', label: 'Home', address: '1240 Mission Street, Apt 5B, San Francisco, CA', isDefault: true },
    { id: 'addr-2', label: 'Work', address: '500 Howard St, Floor 8, San Francisco, CA', isDefault: false },
  ],
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : DEFAULT_USER;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || 'demo-jwt-token-active');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await authApi.login({ email, password });
      setUser(data.user);
      setToken(data.token);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const data = await authApi.register({ name, email, password });
      setUser(data.user);
      setToken(data.token);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const updateProfile = (updates) => {
    setUser((prev) => ({ ...prev, ...updates }));
  };

  const addAddress = (newAddress) => {
    const addressItem = {
      id: 'addr-' + Date.now(),
      ...newAddress,
      isDefault: user?.savedAddresses?.length === 0,
    };
    setUser((prev) => ({
      ...prev,
      savedAddresses: [...(prev.savedAddresses || []), addressItem],
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        addAddress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
