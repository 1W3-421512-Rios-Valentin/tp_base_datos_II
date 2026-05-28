import { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Capturar token pasado desde la app principal via query param
    const params = new URLSearchParams(window.location.search);
    const passedToken = params.get('token');
    if (passedToken) {
      localStorage.setItem('benefits_token', passedToken);
      localStorage.removeItem('benefits_user'); // forzar re-fetch
      window.history.replaceState({}, '', window.location.pathname);
    }

    const token = localStorage.getItem('benefits_token');
    const savedUser = localStorage.getItem('benefits_user');

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setLoading(false);
      } catch {
        localStorage.removeItem('benefits_token');
        localStorage.removeItem('benefits_user');
        setLoading(false);
      }
    } else if (token) {
      // Token presente pero sin datos de usuario: buscarlos en la API
      api.get('/auth/me')
        .then(res => {
          setUser(res.data);
          localStorage.setItem('benefits_user', JSON.stringify(res.data));
        })
        .catch(() => {
          localStorage.removeItem('benefits_token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    const { token, user: userData } = res.data;
    localStorage.setItem('benefits_token', token);
    localStorage.setItem('benefits_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('benefits_token');
    localStorage.removeItem('benefits_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
