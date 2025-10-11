// API Configuration
// Backend รันที่ http://192.168.110.207:5000
// ⚠️ สำคัญ: ใช้ IP Address ของเครื่องคอมพิวเตอร์ ไม่ใช่ localhost (สำหรับ Android/iOS)
export const API_URL = __DEV__
  ? 'http://192.168.110.207:5000/api'  // Development - ใช้ IP Address ของเครื่อง
  : 'https://your-production-api.com/api'; // Production

// Storage Keys
export const STORAGE_KEYS = {
  TOKEN: '@pawmise_token',
  USER_ID: '@pawmise_user_id',
  THEME: '@pawmise_theme',
} as const;

// Pagination
export const DEFAULT_LIMIT = 20;
export const MESSAGES_LIMIT = 50;

// Image Upload
export const MAX_PHOTOS = 5;
export const MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5MB
