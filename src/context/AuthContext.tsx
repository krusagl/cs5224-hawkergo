import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI, userAPI, stallAPI } from '@/services/api';

const API_BASE_URL = "https://xatcwdmrsg.execute-api.ap-southeast-1.amazonaws.com";

export interface User {
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
    const checkAuth = async () => {
      try {
        const storedStallId = localStorage.getItem('stallID');
        
        if (!storedStallId) {
          setLoading(false);
          return;
        }

        const parsedStallId = JSON.parse(storedStallId);
        
        if (!parsedStallId?.stallId) {
          localStorage.removeItem('stallID');
          setLoading(false);
          return;
        }

        try {
          const stallData = await stallAPI.getStallProfile(parsedStallId.stallId);
          if (!stallData?.userID) {
            throw new Error('Invalid stall data');
          }
          
          const userData = await userAPI.getUserProfile(stallData.userID);
          
          const completeUserData: User = {
            id: userData.userID,
            email: userData.email,
            name: userData.userName,
            role: 'hawker' as const,
            stallId: parsedStallId.stallId,
            stallName: stallData.stallName,
            stallAddress: stallData.stallAddress,
            stallDescription: stallData.stallDescription,
            accountType: 'regular',
            subscriptionStatus: 'inactive',
          };
          
          setUser(completeUserData);
        } catch (error) {
          console.error('Error fetching user data:', error);
          localStorage.removeItem('stallID');
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        localStorage.removeItem('stallID');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
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

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await authAPI.login(email, password);
      
      if (response.userID) {
        const essentialUserData = {
          stallId: response.stallID
        };
        
        localStorage.setItem('stallID', JSON.stringify(essentialUserData));
        
        const userProfile = await userAPI.getUserProfile(response.userID);
        let stallData = null;
        if (response.stallID) {
          try {
            stallData = await stallAPI.getStallProfile(response.stallID);
          } catch (error) {
            // Silently handle stall data fetch error
          }
        }
        
        const completeUserData: User = {
          id: response.userID,
          email: email,
          role: 'hawker' as const,
          name: userProfile.userName,
          stallId: response.stallID,
          stallName: stallData?.stallName,
          stallAddress: stallData?.stallAddress,
          stallDescription: stallData?.stallDescription,
          accountType: 'regular',
          subscriptionStatus: 'inactive',
        };
        
        setUser(completeUserData);
        return completeUserData;
      }
      
      throw new Error('Login failed');
    } catch (error) {
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
      //localStorage.setItem('user', JSON.stringify(newUser));
      
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
      setLoading(true);
      localStorage.removeItem('stallID');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      setLoading(true);
      if (!user) throw new Error('Not authenticated');
      
      const updatedUser = { ...user, ...data };
      
      let apiUpdateSuccessful = false;
      
      if (data.name || data.email) {
        await userAPI.updateUserProfile(user.id, {
          userName: data.name || user.name,
          email: data.email || user.email
        });
        apiUpdateSuccessful = true;
      }
      
      if (user.stallId && (data.stallName || data.stallAddress || data.stallDescription)) {
        try {
          await stallAPI.updateStallProfile(user.stallId, {
            stallName: data.stallName || user.stallName,
            stallAddress: data.stallAddress || user.stallAddress,
            stallDescription: data.stallDescription || user.stallDescription
          });
          apiUpdateSuccessful = true;
        } catch (error) {
          throw new Error('Failed to update stall profile');
        }
      }
      
      if (user.isFirstLogin && (data.stallName || data.stallAddress)) {
        updatedUser.isFirstLogin = false;
      }
      
      setUser(updatedUser);
      
      const essentialData = {
        stallId: updatedUser.stallId
      };
      localStorage.setItem('stallID', JSON.stringify(essentialData));
    } catch (error) {
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
