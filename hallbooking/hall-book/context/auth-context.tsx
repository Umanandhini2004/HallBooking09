import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on app start
  useEffect(() => {
    checkUserLoggedIn();
  }, []);

  const checkUserLoggedIn = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        global.token = token;
        const userData = await authAPI.getCurrentUser();
        setUser(userData);
      }
    } catch (err) {
      console.log('User not logged in');
      global.token = null;
      await AsyncStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      const userData = await authAPI.login(email, password);
      console.log('LOGIN DEBUG:', { email, role: userData.role, token: !!global.token });
      setUser(userData);
      return userData;
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, role, phone, department) => {
    try {
      setError(null);
      setLoading(true);
      console.log('Registering user:', name, email, role);
      const userData = await authAPI.register(name, email, password, role, phone, department);
      console.log('Registration success:', userData);
      setUser(userData);
      return userData;
    } catch (err) {
      console.error('Registration error:', err);
      const message = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await authAPI.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const userData = await authAPI.getCurrentUser();
      setUser(userData);
      return userData;
    } catch (err) {
      console.log('Failed to refresh user:', err);
      throw err;
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    refreshUser,
    isAuthenticated: !!user,
  };


  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
