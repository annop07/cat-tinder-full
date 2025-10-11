// services/api.ts - แก้ไขการ import และ response interceptor
import axios, { AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, STORAGE_KEYS } from '../constants/config';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - เพิ่ม JWT token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    } catch (error) {
      console.error('Error in request interceptor:', error);
      return config;
    }
  },
  (error) => Promise.reject(error)
);

// Response interceptor - ✅ แก้ไขให้ชัดเจน
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`✅ ${response.status} ${response.config.url}`);
    console.log('📨 Response data:', response.data);
    
    // ✅ return เฉพาะ response.data เพื่อให้ได้โครงสร้างจาก backend API
    return response.data;
  },
  async (error) => {
    if (error.response?.status === 401) {
      console.log('🔐 Unauthorized - clearing tokens');
      await AsyncStorage.multiRemove([STORAGE_KEYS.TOKEN, STORAGE_KEYS.USER_ID]);
    }
    
    console.error(`❌ ${error.response?.status || 'Network Error'} ${error.config?.url}`, 
      error.response?.data || error.message);
    
    return Promise.reject(error);
  }
);

// ========================================
// Authentication API with proper typing
// ========================================

export const authAPI = {
  register: async (data: {
    email: string;
    password: string;
    username: string;
    phone?: string;
    location: {
      province: string;
      lat: number;
      lng: number;
    };
  }) => {
    console.log('📤 Registering user:', data.email);
    // ✅ Cast เป็น any เพื่อหลีกเลี่ยง TypeScript issues
    return api.post('/auth/register', data) as Promise<any>;
  },

  login: async (data: { email: string; password: string }) => {
    console.log('📤 Logging in user:', data.email);
    return api.post('/auth/login', data) as Promise<any>;
  },

  getCurrentUser: async () => {
    console.log('📤 Getting current user');
    return api.get('/auth/me') as Promise<any>;
  },

  logout: async () => {
    console.log('📤 Logging out user');
    return api.post('/auth/logout') as Promise<any>;
  },
};

// ========================================
// Other APIs...
// ========================================

export const ownerAPI = {
  getProfile: () => api.get('/owners/profile') as Promise<any>,

  updateProfile: (data: {
    username?: string;
    phone?: string;
    location?: {
      province: string;
      district?: string;
      lat: number;
      lng: number;
    };
  }) => api.put('/owners/profile', data) as Promise<any>,

  completeOnboarding: (data: any) => api.post('/owners/onboarding', data) as Promise<any>,
};

export const catAPI = {
  getFeed: (params?: { catId?: string; limit?: number }) => {
    console.log('📤 Getting cat feed with params:', params);
    return api.get('/cats/feed', { params }) as Promise<any>;
  },

  getMyCats: () => api.get('/cats/my-cats') as Promise<any>,

  getCat: (id: string) => api.get(`/cats/${id}`) as Promise<any>,

  createCat: (data: FormData) => {
    console.log('📤 Creating cat with FormData');
    return api.post('/cats', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }) as Promise<any>;
  },

  updateCat: (id: string, data: FormData) =>
    api.put(`/cats/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }) as Promise<any>,

  deleteCat: (id: string) => api.delete(`/cats/${id}`) as Promise<any>,
};

export const swipeAPI = {
  createSwipe: (data: {
    swiperCatId: string;
    targetCatId: string;
    action: 'like' | 'pass';
  }) => {
    console.log('📤 Creating swipe:', data.action);
    return api.post('/swipes', data) as Promise<any>;
  },

  getLikesSent: (catId: string) => api.get(`/swipes/likes-sent/${catId}`) as Promise<any>,

  getLikesReceived: (catId: string) => api.get(`/swipes/likes-received/${catId}`) as Promise<any>,
};

export const matchAPI = {
  getMatches: (params?: { limit?: number; skip?: number }) =>
    api.get('/matches', { params }) as Promise<any>,

  getMatch: (id: string) => api.get(`/matches/${id}`) as Promise<any>,

  deleteMatch: (id: string) => api.delete(`/matches/${id}`) as Promise<any>,
};

export const messageAPI = {
  getMessages: (matchId: string, params?: { limit?: number; before?: string }) =>
    api.get(`/messages/${matchId}`, { params }) as Promise<any>,

  sendMessage: (data: { matchId: string; text: string }) =>
    api.post('/messages', data) as Promise<any>,

  markAsRead: (matchId: string) => api.put(`/messages/${matchId}/read`) as Promise<any>,
};

export default api;