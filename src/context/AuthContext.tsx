import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

interface User {
  id: number;
  email: string;
  role: string;
  fullName: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  // 1. Check if user is already logged in on App Start
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          // Verify token and get user details from your backend
          const response = await axiosClient.get('/users/me');
          setUser(response.data);
        } catch (error) {
          console.error("Token invalid:", error);
          logout();
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  // 2. Login Function
  const login = async (email: string, password: string) => {
    try {
      const response = await axiosClient.post('/auth/login', { email, password });
      
      const { token: newToken, user: newUser } = response.data;
      
      // Safety check: Ensure only instructors/admins can login here
      if (newUser.role !== 'instructor' && newUser.role !== 'admin') {
        throw new Error("Unauthorized: This portal is for Instructors only.");
      }

      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(newUser);
    } catch (error) {
      throw error; // Let the UI handle the error display
    }
  };

  // 3. Logout Function
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook for easy access
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};