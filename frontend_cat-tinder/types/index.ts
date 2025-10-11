export interface Owner {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  phone?: string;
  avatarUrl?: string;
  location: {
    province: string;
    district?: string;
    lat: number;
    lng: number;
  };
  onboardingCompleted: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Cat {
  _id: string;
  ownerId: string | Owner;
  name: string;
  gender: 'male' | 'female';
  ageYears: number;
  ageMonths: number;
  breed: string;
  color?: string;
  traits: string[]; // ['playful', 'calm', 'friendly', 'shy', 'affectionate']
  photos: {
    url: string;
    publicId?: string;
  }[];
  readyForBreeding: boolean;
  vaccinated: boolean;
  neutered: boolean;
  notes?: string;
  location: {
    province: string;
    district?: string;
    lat: number;
    lng: number;
  };
  active: boolean;
  distance?: number; // จาก API response
  createdAt: string;
  updatedAt: string;
}

export interface Swipe {
  _id: string;
  swiperOwnerId: string;
  swiperCatId: string;
  targetCatId: string;
  action: 'like' | 'pass';
  createdAt: string;
}

export interface Match {
  _id: string;
  catAId: string | Cat;
  ownerAId: string | Owner;
  catBId: string | Cat;
  ownerBId: string | Owner;
  lastMessageAt?: string;
  createdAt: string;
}

export interface Message {
  _id: string;
  matchId: string;
  senderOwnerId: string | Owner;
  text: string;
  read: boolean;
  sentAt: string;
}

// API Response Types
export interface AuthResponse {
  status: 'ok' | 'error';
  message?: string;
  data?: {
    token: string;
    userId: string;
    onboardingCompleted: boolean;
  };
}

export interface CatFeedResponse {
  status: 'ok' | 'error';
  message?: string;
  data?: {
    cats: Cat[];
    myCatId: string;
  };
}

export interface SwipeResponse {
  status: 'ok' | 'error';
  message?: string;
  data?: {
    matched: boolean;
    match?: Match;
  };
}

export interface ApiResponse<T = any> {
  status: 'ok' | 'error';
  message?: string;
  data?: T;
}