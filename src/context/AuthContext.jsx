import { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser } from '../api/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (userId, token) => {
    console.log('fetchUserData called with:', { userId, token });
    try {
      console.log('Making API call to getCurrentUser with userId:', userId);
      const userData = await getCurrentUser(userId);
      console.log('Fetched user data:', userData);
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
    
    console.log('AuthContext useEffect - checking localStorage:', { token, userId, storedUserData });
    
    if (token && storedUserData) {
      try {
        const userData = JSON.parse(storedUserData);
        console.log('Restored user data from localStorage:', userData);
        setUser({ ...userData, token });
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userData');
      }
    } else {
      console.log('No complete user data found in localStorage');
    }
    setLoading(false);
  }, []);

  const login = async (userData, token) => {
    console.log('Login called with:', { userData, token });
    
    // Save token and user data to localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userData.id);
    localStorage.setItem('userData', JSON.stringify(userData));
    
    // Set user data in context
    setUser({ ...userData, token });
    
    console.log('User data stored in localStorage and context');
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