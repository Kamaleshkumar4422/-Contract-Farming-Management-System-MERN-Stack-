import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const DEMO_USERS = {
  farmer: {
    email: 'farmer@krishiseva.com',
    password: 'Password123!',
    label: 'Farmer (Ramesh Patel)',
    description: '12.5 Acres, Basmati Rice & Wheat grower',
  },
  buyer: {
    email: 'buyer@greenharvest.com',
    password: 'Password123!',
    label: 'Buyer (GreenHarvest Agro)',
    description: 'Agro processor issuing institutional contracts',
  },
  officer: {
    email: 'officer@agriinspect.gov',
    password: 'Password123!',
    label: 'Field Officer (Anjali Deshmukh)',
    description: 'Government agricultural extension auditor',
  },
  admin: {
    email: 'admin@agriflow.com',
    password: 'Password123!',
    label: 'Platform Admin (Dr. Sharma)',
    description: 'Full governance, dispute arbitration & financials',
  },
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('agriflow_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('agriflow_token');
      const savedUser = localStorage.getItem('agriflow_user');

      if (savedToken && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          setToken(savedToken);
          // Verify with backend
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('agriflow_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Auth token sync failed, re-authenticating:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { token, user } = res.data;
        setToken(token);
        setUser(user);
        localStorage.setItem('agriflow_token', token);
        localStorage.setItem('agriflow_user', JSON.stringify(user));
        return { success: true, user };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please verify credentials.';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const quickDemoLogin = async (roleKey) => {
    const creds = DEMO_USERS[roleKey];
    if (!creds) return { success: false, message: 'Invalid role key' };
    return await login(creds.email, creds.password);
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', userData);
      if (res.data.success) {
        const { token, user } = res.data;
        setToken(token);
        setUser(user);
        localStorage.setItem('agriflow_token', token);
        localStorage.setItem('agriflow_user', JSON.stringify(user));
        return { success: true, user };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please check your inputs.';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('agriflow_token');
    localStorage.removeItem('agriflow_user');
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem('agriflow_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.error('Failed to refresh user:', err.message);
    }
  };

  const isFarmer = user?.role === 'farmer';
  const isBuyer = user?.role === 'buyer';
  const isOfficer = user?.role === 'officer';
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        quickDemoLogin,
        register,
        logout,
        refreshUser,
        isFarmer,
        isBuyer,
        isOfficer,
        isAdmin,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
