import axios from 'axios';
import { Platform } from 'react-native';

// กำหนด Base URL ตาม Platform
const getBaseURL = () => {
  // ถ้าเป็น Android Emulator ใช้ 10.0.2.2
  // ถ้าเป็น iOS Simulator หรือ Physical Device ใช้ IP จริง
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5001'; // Android Emulator
  }
  
  // สำหรับ iOS และ Physical Devices
  // เปลี่ยนเป็น IP address ของคอมพิวเตอร์คุณ
  return 'http://192.168.1.182:5001';
};

// สร้าง axios instance
const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000, // 10 วินาที
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    console.log('🚀 API Request:', config.method?.toUpperCase(), config.url);
    return config;
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
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('⏱️ Request Timeout:', error.config?.url);
    } else if (error.response) {
      console.error('❌ API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('❌ Network Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;

// Export helpers
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  
  // Users
  USERS: '/api/users',
  
  // Cats
  CATS: '/api/cats',
  
  // Matches
  MATCHES: '/api/matches',
  
  // Conversations
  CONVERSATIONS: '/api/conversations',
  
  // Messages
  MESSAGES: '/api/messages',
};