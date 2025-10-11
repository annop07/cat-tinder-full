import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '@/services/api';
import { STORAGE_KEYS } from '@/constants/config';
import type { Owner } from '@/types';

interface AuthContextType {
  user: Owner | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Owner | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const savedToken = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
      if (savedToken) {
        setToken(savedToken);
        try {
          const response: any = await authAPI.getCurrentUser();
          if (response.status === 'ok' && response.data) {
            setUser(response.data);
          } else {
            await logout();
          }
        } catch (error: any) {
          console.log('Token invalid or user not found, clearing token...');
          // ถ้า token หมดอายุหรือ user ถูกลบ ให้ logout
          await logout();
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      await logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response: any = await authAPI.login({ email, password });
    console.log('Login response:', response);

    if (response.status === 'ok' && response.data) {
      const { token: newToken, userId } = response.data;

      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, newToken);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, userId);
      setToken(newToken);

      console.log('Fetching current user...');
      const userResponse: any = await authAPI.getCurrentUser();
      console.log('GetCurrentUser response:', userResponse);

      if (userResponse.status === 'ok' && userResponse.data) {
        setUser(userResponse.data);
        console.log('User set successfully:', userResponse.data);
      } else {
        console.error('Failed to get user data:', userResponse);
        throw new Error('Failed to fetch user data');
      }
    } else {
      throw new Error(response.message || 'Login failed');
    }
  };

  const register = async (data: any) => {
    const response: any = await authAPI.register(data);
    console.log('Register response:', response);

    if (response.status === 'ok' && response.data) {
      const { token: newToken, userId } = response.data;

      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, newToken);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, userId);
      setToken(newToken);

      const userResponse: any = await authAPI.getCurrentUser();
      if (userResponse.status === 'ok' && userResponse.data) {
        setUser(userResponse.data);
      }
    } else {
      throw new Error(response.message || 'Registration failed');
    }
  };

  const logout = async () => {
    await AsyncStorage.multiRemove([STORAGE_KEYS.TOKEN, STORAGE_KEYS.USER_ID]);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};