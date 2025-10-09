import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// กำหนด Base URL ตาม Platform
const getBaseURL = () => {
  // สำหรับ Android Emulator
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000';
  }
  
  // สำหรับ iOS Simulator และ Physical Devices
  // เปลี่ยนเป็น IP address ของคอมพิวเตอร์คุณ
  return 'http://192.168.1.182:5000';
};

// สร้าง axios instance
const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor - เพิ่ม token ทุกครั้งที่ส่ง request
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      console.log('🚀 API Request:', config.method?.toUpperCase(), config.url);
      return config;
    } catch (error) {
      console.error('Error in request interceptor:', error);
      return config;
    }
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.url, response.status);
    return response;
  },
  async (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('⏱️ Request Timeout:', error.config?.url);
    } else if (error.response) {
      console.error('❌ API Error:', error.response.status, error.response.data);
      
      // ถ้า token หมดอายุ ให้ลบ token และ redirect ไป login
      if (error.response.status === 401) {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('userId');
        // จะต้องใช้ navigation หรือ router เพื่อ redirect
      }
    } else if (error.request) {
      console.error('❌ Network Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;

// Export API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  ME: '/api/auth/me',
  
  // Users
  USERS: '/api/users',
  USER_PROFILE: (userId: string) => `/api/users/${userId}`,
  UPDATE_PROFILE: '/api/users/profile',
  
  // Cats
  CATS: '/api/cats',
  USER_CATS: (userId: string) => `/api/cats/user/${userId}`,
  CAT_DETAIL: (catId: string) => `/api/cats/${catId}`,
  
  // Matches
  MATCHES: '/api/matches',
  SWIPE: '/api/matches/swipe',
  GET_MATCHES: '/api/matches/list',
  
  // Conversations
  CONVERSATIONS: '/api/conversations',
  CREATE_CONVERSATION: '/api/conversations/create',
  CONVERSATION_LIST: '/api/conversations/list',
  CONVERSATION_DETAIL: (conversationId: string) => `/api/conversations/${conversationId}`,
  
  // Messages
  MESSAGES: '/api/messages',
  CONVERSATION_MESSAGES: (conversationId: string) => `/api/messages/conversation/${conversationId}`,
  UNREAD_COUNT: '/api/messages/unread/count',
};

// Export Base URL สำหรับ Socket.IO
export const SOCKET_URL = getBaseURL();