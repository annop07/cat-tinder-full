import axios from 'axios';
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

// Request interceptor - @4H! JWT token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      console.log(`=� ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    } catch (error) {
      console.error('Error in request interceptor:', error);
      return config;
    }
  },
  (error) => Promise.reject(error)
);

// Response interceptor - 12# error
api.interceptors.response.use(
  (response) => {
    console.log(`=� ${response.status} ${response.config.url}`);
    return response.data;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired - %I2 storage
      await AsyncStorage.multiRemove([STORAGE_KEYS.TOKEN, STORAGE_KEYS.USER_ID]);
    }
    console.error(`L ${error.response?.status} ${error.config?.url}`, error.response?.data);
    return Promise.reject(error);
  }
);

// ========================================
// Authentication API
// ========================================

export const authAPI = {
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    displayName: string;
    phone?: string;
    location: {
      province: string;
      lat: number;
      lng: number;
    };
  }) => api.post('/auth/register', data, {
    headers: {
      Authorization: '', // Don't send token for register
    },
  }),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data, {
      headers: {
        Authorization: '', // Don't send token for login
      },
    }),

  getCurrentUser: () => api.get('/auth/me'),
};

// ========================================
// Owner API
// ========================================

export const ownerAPI = {
  getProfile: () => api.get('/owners/profile'),

  updateProfile: (data: {
    firstName?: string;
    lastName?: string;
    displayName?: string;
    phone?: string;
    location?: {
      province: string;
      district?: string;
      lat: number;
      lng: number;
    };
  }) => api.put('/owners/profile', data),

  completeOnboarding: (data: any) => api.post('/owners/onboarding', data),
};

// ========================================
// Cat API
// ========================================

export const catAPI = {
  getFeed: (params?: { catId?: string; limit?: number }) =>
    api.get('/cats/feed', { params }),

  getMyCats: () => api.get('/cats/my-cats'),

  getCat: (id: string) => api.get(`/cats/${id}`),

  createCat: (data: FormData) =>
    api.post('/cats', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  updateCat: (id: string, data: FormData) =>
    api.put(`/cats/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  deleteCat: (id: string) => api.delete(`/cats/${id}`),
};

// ========================================
// Swipe API
// ========================================

export const swipeAPI = {
  createSwipe: (data: {
    swiperCatId: string;
    targetCatId: string;
    action: 'like' | 'pass';
  }) => api.post('/swipes', data),

  getLikesSent: (catId: string) => api.get(`/swipes/likes-sent/${catId}`),

  getLikesReceived: (catId: string) => api.get(`/swipes/likes-received/${catId}`),
};

// ========================================
// Match API
// ========================================

export const matchAPI = {
  getMatches: (params?: { limit?: number; skip?: number }) =>
    api.get('/matches', { params }),

  getMatch: (id: string) => api.get(`/matches/${id}`),

  deleteMatch: (id: string) => api.delete(`/matches/${id}`),
};

// ========================================
// Message API
// ========================================

export const messageAPI = {
  getMessages: (matchId: string, params?: { limit?: number; before?: string }) =>
    api.get(`/messages/${matchId}`, { params }),

  sendMessage: (data: { matchId: string; text: string }) =>
    api.post('/messages', data),

  markAsRead: (matchId: string) => api.put(`/messages/${matchId}/read`),
};

// Export aliases for compatibility
export const catsApi = catAPI;
export const swipesApi = swipeAPI;
export const matchesApi = matchAPI;
export const messagesApi = messageAPI;
export const ownersApi = ownerAPI;

export default api;
