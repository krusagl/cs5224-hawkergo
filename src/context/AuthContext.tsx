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
  accountType?: 'demo' | 'regular' | 'premium' | 'admin';
  subscriptionStatus?: 'active' | 'inactive' | 'trial';
  subscriptionExpiry?: string;
  isFirstLogin?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, accountType?: 'demo' | 'regular' | 'premium' | 'admin') => Promise<void>;
  register: (userData: Partial<User>, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  hasActiveSubscription: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// API endpoints for auth - can be replaced with real values later
const API_ENDPOINTS = {
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  LOGOUT: '/api/auth/logout',
  PROFILE: '/api/auth/profile',
  SUBSCRIPTION: '/api/auth/subscription',
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

  const hasActiveSubscription = () => {
    if (!user) return false;
    
    // Check if user has a premium account type or active subscription
    if (user.accountType === 'premium' || user.accountType === 'admin') return true;
    
    if (user.subscriptionStatus === 'active') {
      // If subscription has an expiry date, check if it's still valid
      if (user.subscriptionExpiry) {
        const expiryDate = new Date(user.subscriptionExpiry);
        return expiryDate > new Date();
      }
      return true;
    }
    
    return false;
  };

  const login = async (email: string, password: string, accountType?: 'demo' | 'regular' | 'premium' | 'admin') => {
    try {
      setLoading(true);
      // In a real app, this would be a fetch call to your authentication API
      // const response = await fetch(API_ENDPOINTS.LOGIN, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password })
      // });
      // const data = await response.json();
      
      // For now, we'll simulate a successful login with mock data
      const mockUser: User = {
        id: '001',
        email,
        name: accountType || email.split('@')[0],
        role: 'hawker',
        stallName: accountType === 'demo' ? 'Ah Ming Noodles' : '',
        stallAddress: accountType === 'demo' ? 'Maxwell Food Centre, #01-23' : '',
        stallDescription: accountType === 'demo' ? 'Traditional Chinese noodles with the best ingredients since 1980' : '',
        accountType: accountType || 'regular',
        subscriptionStatus: accountType === 'premium' ? 'active' : 'inactive',
        isFirstLogin: accountType !== 'demo',
      };
      
      if (accountType === 'premium') {
        // Set subscription expiry to 30 days from now
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);
        mockUser.subscriptionExpiry = expiryDate.toISOString();
      }
      
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
      // const response = await fetch(API_ENDPOINTS.REGISTER, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ ...userData, password })
      // });
      // const data = await response.json();
      
      // For now, we'll simulate a successful registration
      const newUser: User = {
        id: Math.random().toString(36).substring(2, 9),
        email: userData.email || '',
        name: userData.name || '',
        role: userData.role || 'hawker',
        stallName: userData.stallName || '',
        stallAddress: userData.stallAddress || '',
        stallDescription: userData.stallDescription || '',
        stallLogo: userData.stallLogo || '',
        accountType: 'regular',
        subscriptionStatus: 'inactive',
        isFirstLogin: true,
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
    try {
      // In a real app, this would be a fetch call to your logout API
      // await fetch(API_ENDPOINTS.LOGOUT, { method: 'POST' });
      
      // Clear user data and storage
      setUser(null);
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      setLoading(true);
      if (!user) throw new Error('Not authenticated');
      
      // In a real app, this would be a fetch call to your profile update API
      // await fetch(API_ENDPOINTS.PROFILE, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data)
      // });
      
      // Update user data
      const updatedUser = { ...user, ...data };
      
      // If this was the first login, and the user is updating their profile, 
      // set isFirstLogin to false
      if (user.isFirstLogin && (data.stallName || data.stallAddress)) {
        updatedUser.isFirstLogin = false;
      }
      
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
    hasActiveSubscription,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
