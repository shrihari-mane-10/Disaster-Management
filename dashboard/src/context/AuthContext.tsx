import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authApi } from '../lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAuthority: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('disaster_auth_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('disaster_auth_token');
      if (storedToken) {
        try {
          const userData = await authApi.getMe();
          if (userData.role === 'authority' || userData.role === 'admin') {
            setUser(userData);
            setToken(storedToken);
          } else {
            // Citizen/Volunteer cannot access Authority Dashboard
            logout();
          }
        } catch (err) {
          console.error('Session restoration failed:', err);
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    const { user: loggedInUser, token: receivedToken } = await authApi.login(email, pass);
    if (loggedInUser.role !== 'authority' && loggedInUser.role !== 'admin') {
      throw new Error('Access denied. Only Authority and Admin personnel can access this dashboard.');
    }
    localStorage.setItem('disaster_auth_token', receivedToken);
    localStorage.setItem('disaster_auth_user', JSON.stringify(loggedInUser));
    setToken(receivedToken);
    setUser(loggedInUser);
  };

  const logout = () => {
    localStorage.removeItem('disaster_auth_token');
    localStorage.removeItem('disaster_auth_user');
    setToken(null);
    setUser(null);
  };

  const isAuthority = user?.role === 'authority' || user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        isAuthenticated: !!token && !!user,
        isAuthority,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
