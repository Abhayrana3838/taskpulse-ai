import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    const token = localStorage.getItem('tp_token');
    console.log('AuthContext: fetchMe called, token exists:', !!token);
    if (!token) { setLoading(false); return; }
    try {
      console.log('AuthContext: Making /api/auth/me request...');
      const { data } = await api.get('/api/auth/me');
      console.log('AuthContext: /api/auth/me response:', data);
      setUser(data);
    } catch (error) {
      console.error('AuthContext: fetchMe error:', error);
      console.error('AuthContext: fetchMe error response:', error.response);
      localStorage.removeItem('tp_token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMe(); }, [fetchMe]);

  const login = async (email, password) => {
    console.log('AuthContext: Login called with', { email, password });
    try {
      const response = await api.post('/api/auth/login', { email, password });
      console.log('AuthContext: Login response', response.data);
      localStorage.setItem('tp_token', response.data.access_token);
      console.log('AuthContext: Token saved, calling fetchMe...');
      await fetchMe();
      console.log('AuthContext: fetchMe completed, login successful');
    } catch (error) {
      console.error('AuthContext: Login error', error);
      console.error('AuthContext: Error response', error.response);
      throw error;
    }
  };

  const register = async (name, email, password) => {
    console.log('AuthContext: Register called with', { name, email });
    try {
      const response = await api.post('/api/auth/register', { name, email, password });
      console.log('AuthContext: Register response', response.data);
      localStorage.setItem('tp_token', response.data.access_token);
      await fetchMe();
    } catch (error) {
      console.error('AuthContext: Register error', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('tp_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
