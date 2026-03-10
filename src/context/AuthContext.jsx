import { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser } from '../api/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (userId, token) => {
    try {
      const userData = await getCurrentUser(userId);
      setUser({ ...userData, token });
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      // If fetch fails, clear invalid token
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      setUser(null);
    }
  };

  useEffect(() => {
    // Check if a token exists in local storage when the app loads
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const storedUserData = localStorage.getItem('userData');
    
    if (token && storedUserData) {
      try {
        const userData = JSON.parse(storedUserData);
        setUser({ ...userData, token });
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userData');
      }
    }
    setLoading(false);
  }, []);

  const login = async (userData, token) => {
    // Save token and user data to localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userData.id);
    localStorage.setItem('userData', JSON.stringify(userData));
    
    // Set user data in context
    setUser({ ...userData, token });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userData');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);