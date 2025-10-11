export interface Location {
  province: string;
  district?: string;
  lat: number;
  lng: number;
}

export interface Owner {
  _id: string;
  email: string;
  username: string;
  phone?: string;
  avatarUrl?: string;
  location?: Location;
  onboardingCompleted: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Photo {
  url: string;
  publicId: string;
}

export interface Cat {
  _id: string;
  ownerId: Owner;
  name: string;
  gender: 'male' | 'female';
  ageYears: number;
  ageMonths: number;
  breed: string;
  color?: string;
  traits: string[];
  photos: Photo[];
  readyForBreeding: boolean;
  vaccinated: boolean;
  notes?: string;
  location?: Location;
  active: boolean;
  distance?: number; // For nearby cats
  createdAt: string;
  updatedAt: string;
}

export interface Match {
  _id: string;
  catAId: Cat;
  ownerAId: Owner;
  catBId: Cat;
  ownerBId: Owner;
  lastMessageAt?: string;
  createdAt: string;
}

export interface Message {
  _id: string;
  matchId: string;
  senderOwnerId: Owner;
  text: string;
  read: boolean;
  sentAt: string;
}

export interface Swipe {
  _id: string;
  swiperOwnerId: string;
  swiperCatId: string;
  targetCatId: Cat;
  action: 'like' | 'pass';
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  status: 'ok' | 'error';
  message?: string;
  data?: T;
  errors?: any[];
}

export interface CatFeedResponse extends ApiResponse {
  data?: {
    cats: Cat[];
    myCatId: string;
  };
}

export interface SwipeResponse extends ApiResponse {
  data?: {
    swipe: Swipe;
    matched: boolean;
    match?: Match;
  };
}

// Form Types
export interface RegisterData {
  email: string;
  password: string;
  username: string;
  phone?: string;
  location: Location;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface CreateCatData {
  name: string;
  gender: 'male' | 'female';
  ageYears: number;
  ageMonths: number;
  breed: string;
  color?: string;
  traits: string[];
  photos: string[]; // URI strings for React Native
  vaccinated: boolean;
  notes?: string;
}