import { createContext, useState, useEffect } from 'react';
import api from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {      
        const response = await api.get('/users/me');
        setUser(response.data); // Save user data globally
      } catch (error) {
        console.error("Session expired or invalid token.");
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};