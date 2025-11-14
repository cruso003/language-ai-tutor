import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '../api/client';
import * as SecureStore from 'expo-secure-store';

interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'learner' | 'creator' | 'admin';
  avatarUrl?: string;
  emailVerified: boolean;
}

interface UserProfile {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  avatarGlbUrl?: string;
  bio?: string;
  targetLanguage?: string;
  nativeLanguage?: string;
  proficiencyLevel?: string;
  interests?: string[];
  timezone?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');

      if (token) {
        const userData = await apiClient.getMe();
        setUser(userData.user);
        setProfile(userData.profile);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      await apiClient.clearTokens();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.login(email, password);
      setUser(response.user);
      setProfile(response.profile);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, displayName: string) => {
    try {
      const response = await apiClient.register(email, password, displayName);

      // Auto-login after registration
      if (response.message?.includes('verification')) {
        // Email verification required
        throw new Error('Please check your email to verify your account');
      }

      // If auto-login is enabled
      if (response.accessToken) {
        await apiClient.setTokens(response.accessToken, response.refreshToken);
        setUser(response.user);
        setProfile(response.profile);
      }
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } finally {
      setUser(null);
      setProfile(null);
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await apiClient.getMe();
      setUser(userData.user);
      setProfile(userData.profile);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      throw error;
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    try {
      const updatedProfile = await apiClient.updateProfile(data);
      setProfile(updatedProfile);
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
