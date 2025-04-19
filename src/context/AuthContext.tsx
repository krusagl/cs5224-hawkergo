import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI, userAPI, stallAPI } from '@/services/api';

export interface User {
  PK: string;
  SK: string;
  id: string;
  email: string;
  name: string;
  role: 'hawker' | 'customer' | 'admin';
  stallName?: string;
  stallAddress?: string;
  stallDescription?: string;
  stallLogo?: string;
  stallId?: string;
  accountType?: 'demo' | 'regular' | 'premium' | 'admin';
  subscriptionStatus?: 'active' | 'inactive' | 'trial';
  subscriptionExpiry?: string;
  isFirstLogin?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, accountType?: 'demo' | 'regular' | 'premium' | 'admin') => Promise<User>;
  register: (userData: Partial<User>, password: string) => Promise<User>;
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
      
      // Handle demo account with mock data
      if (accountType === 'demo') {
        const mockUser: User = {
          PK: 'demo',
          SK: 'demo',
          id: '1',
          email,
          name: 'Demo User',
          role: 'hawker',
          stallName: 'Ah Ming Noodles',
          stallAddress: 'Maxwell Food Centre, #01-23',
          stallDescription: 'Traditional Chinese noodles with the best ingredients since 1980',
          accountType: 'demo',
          subscriptionStatus: 'inactive',
          isFirstLogin: false,
          stallId: 'demo-stall-1'
        };
        
        setUser(mockUser);
        localStorage.setItem('user', JSON.stringify(mockUser));
        return mockUser;
      }
      
      // Handle real authentication for all other accounts
      console.log('Calling login API with:', email, password);
      const loginResponse = await authAPI.login(email, password);
      console.log('Login API response:', loginResponse);
      
      // Create user object from login response
      const user: User = {
        PK: 'user',
        SK: loginResponse.userID,
        id: loginResponse.userID,
        email,
        name: loginResponse.userName,
        role: accountType === 'admin' ? 'admin' : 'hawker',
        accountType: accountType || 'regular',
        subscriptionStatus: accountType === 'premium' ? 'active' : 'inactive',
        isFirstLogin: true,
      };
      
      // Try to get user's stall information
      // ✅ If stallID is returned, fetch stall details
      if (loginResponse.stallID) {
        user.stallId = loginResponse.stallID;
        try {
          const stall = await stallAPI.getStallProfile(loginResponse.stallID);
          user.stallName = stall.stallName;
          user.stallAddress = stall.stallAddress;
          user.stallDescription = stall.stallDescription;
          // user.stallLogo = stall.stallLogo;
        } catch (err) {
          console.warn('Failed to load stall info:', err);
        }
      }
      
      // Set subscription expiry for premium accounts
      if (accountType === 'premium') {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);
        user.subscriptionExpiry = expiryDate.toISOString();
      }
      
      // Set permanent active status for admin accounts
      if (accountType === 'admin') {
        user.subscriptionStatus = 'active';
      }
      
      console.log('Final user object after login:', user);
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (error) {
      console.error('Login failed:', error);
      // Throw error to be handled by the login component
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
      
      // 1. Create user account
      const userResponse = await userAPI.createUser(
        userData.name || '',
        userData.email || '',
        password
      );
      
      // 2. Create stall for the user
      const stallResponse = await userAPI.createStall(userResponse.userID, {
        stallName: userData.stallName || '',
        stallAddress: userData.stallAddress || '',
        stallDescription: userData.stallDescription || '',
      });
      
      // 3. Create user object with all the data
      const newUser: User = {
        PK: 'user',
        SK: userResponse.userID,
        id: userResponse.userID,
        email: userData.email || '',
        name: userData.name || '',
        role: 'hawker',
        stallName: userData.stallName || '',
        stallAddress: userData.stallAddress || '',
        stallDescription: userData.stallDescription || '',
        stallLogo: userData.stallLogo || '',
        stallId: stallResponse.stallID,
        accountType: 'regular',
        subscriptionStatus: 'inactive',
        isFirstLogin: true,
      };
      
      // 4. Update state and storage
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      return newUser;
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
      
      // Create a copy of the user data that we'll update
      const updatedUser = { ...user, ...data };
      console.log('Updating user profile with:', data);
      
      // Track if we've made any successful API calls
      let apiUpdateSuccessful = false;
      
      // Update user profile in the database if name or email changed
      if (data.name || data.email) {
        console.log('⏫ Sending user profile update:', data);
        await userAPI.updateUserProfile(user.id, {
          userName: data.name || user.name,
          email: data.email || user.email
        });
        apiUpdateSuccessful = true;
      }
      
      // Update stall information in the database if any stall data changed
      if (user.stallId && (data.stallName || data.stallAddress || data.stallDescription)) {
        try {
          await stallAPI.updateStallProfile(user.stallId, {
            stallName: data.stallName || user.stallName,
            stallAddress: data.stallAddress || user.stallAddress,
            stallDescription: data.stallDescription || user.stallDescription
          });
          apiUpdateSuccessful = true;
          console.log('Stall profile updated successfully');
        } catch (error) {
          console.error('Failed to update stall profile:', error);
          throw new Error('Failed to update stall profile');
        }
      }
      
      // If this was the first login, and the user is updating their profile, 
      // set isFirstLogin to false
      if (user.isFirstLogin && (data.stallName || data.stallAddress)) {
        updatedUser.isFirstLogin = false;
      }
      
      // Always update local state so the UI shows the changes
      // This ensures a better user experience even if the API call fails
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      console.log('User data updated locally:', updatedUser);
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
