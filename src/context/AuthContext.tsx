
import React, { createContext, useState, useContext, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'hawker' | 'customer' | 'admin';
  stallName?: string;
  stallAddress?: string;
  stallDescription?: string;
  stallLogo?: string;
  accountType?: 'demo' | 'admin';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, accountType?: 'demo' | 'admin') => Promise<void>;
  register: (userData: Partial<User>, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, accountType?: 'demo' | 'admin') => {
    try {
      setLoading(true);
      // In a real app, this would be a fetch call to your authentication API
      // For now, we'll simulate a successful login with mock data
      const mockUser: User = {
        id: '1',
        email,
        name: accountType ? accountType.charAt(0).toUpperCase() + accountType.slice(1) : 'Sample Hawker',
        role: 'hawker',
        stallName: 'Ah Ming Noodles',
        stallAddress: 'Maxwell Food Centre, #01-23',
        stallDescription: 'Traditional Chinese noodles with the best ingredients since 1980',
        accountType: accountType,
      };
      
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: Partial<User>, password: string) => {
    try {
      setLoading(true);
      // In a real app, this would be a fetch call to your registration API
      // For now, we'll simulate a successful registration
      const newUser: User = {
        id: Math.random().toString(36).substring(2, 9),
        email: userData.email || '',
        name: userData.name || '',
        role: userData.role || 'hawker',
        stallName: userData.stallName,
        stallAddress: userData.stallAddress,
        stallDescription: userData.stallDescription,
        stallLogo: userData.stallLogo,
      };
      
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    // Clear user data and storage
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      setLoading(true);
      if (!user) throw new Error('Not authenticated');
      
      // Update user data
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
