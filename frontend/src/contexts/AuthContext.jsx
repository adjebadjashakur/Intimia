import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { post, get } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const response = await get('/auth/me');
      setUser(response.data.data || response.data.user || response.data);
    } catch (error) {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token, fetchUser]);

  const login = async (email, password) => {
    const response = await post('/auth/login', { email, password });
    const data = response.data.data || response.data;
    const newToken = data.token || data.access_token;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(data.user || data);
    return data;
  };

  const register = async (name, email, password) => {
    const response = await post('/auth/register', { name, email, password });
    const data = response.data.data || response.data;
    const newToken = data.token || data.access_token;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(data.user || data);
    return data;
  };

  const logout = async () => {
    try {
      await post('/auth/logout');
    } catch (error) {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    }
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
