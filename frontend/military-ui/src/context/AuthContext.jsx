import React, { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../api/client';

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [access, setAccess] = useState(localStorage.getItem('access'));
  const [refresh, setRefresh] = useState(localStorage.getItem('refresh'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    setAccess(null);
    setRefresh(null);
    setUser(null);
  };

  useEffect(() => {
    async function loadUser() {
      if (!access) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const decoded = jwtDecode(access);
        const userId = decoded.user_id;
        const res = await api.get(`/users/${userId}/`);
        setUser(res.data);
      } catch (err) {
        console.error('Failed to load user', err);
        logout();
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [access]); 

  const login = async (username, password) => {
    const res = await api.post('/auth/login/', { username, password });
    const { access: accessToken, refresh: refreshToken } = res.data;
    localStorage.setItem('access', accessToken);
    localStorage.setItem('refresh', refreshToken);
    setAccess(accessToken);
    setRefresh(refreshToken);
  };

  const value = {
    access,
    refresh,
    user,
    role: user?.role || null,
    baseId: user?.base || null,
    isAdmin: user?.role === 'ADMIN',
    isCommander: user?.role === 'COMMANDER',
    isLogistics: user?.role === 'LOGISTICS',
    login,
    logout,
  };

  if (loading) {
    return <div style={{ padding: 20 }}>Loading auth...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
