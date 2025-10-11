# Pawmise Frontend - สถานะและขั้นตอนต่อไป

## ✅ ส่วนที่เสร็จแล้ว (Ready to Use)

### 1. Design System
- ✅ `constants/Colors.ts` - Pink theme colors สำหรับ Light/Dark mode
- ✅ `contexts/ThemeContext.tsx` - Theme management

### 2. Configuration
- ✅ `constants/config.ts` - API URL (localhost:5000) + Storage keys
- ✅ `services/api.ts` - Complete API service layer with JWT auth

### 3. Existing Files (ต้องอัพเดท)
- ⚠️ `contexts/AuthContext.tsx` - **ต้องแก้ไขให้ใช้ JWT แทน ownerId**
- ⚠️ `types/index.ts` - **ต้องอัพเดทให้ตรงกับ Backend models**
- ⚠️ `app/_layout.tsx` - ใช้ได้แล้ว แต่ต้องเช็ค token แทน ownerId
- ⚠️ Screen ต่างๆ - ยังไม่มี UI จริง

---

## 🔨 ขั้นตอนต่อไป (ทำตามลำดับ)

### Step 1: อัพเดท Types ให้ตรงกับ Backend

แก้ไขไฟล์ `types/index.ts`:

```typescript
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
```

---

### Step 2: อัพเดท AuthContext

แก้ไขไฟล์ `contexts/AuthContext.tsx`:

```typescript
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
        const response = await authAPI.getCurrentUser();
        setUser(response.data);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      await logout(); // ถ้า token หมดอายุให้ logout
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await authAPI.login({ email, password });
    const { token: newToken, userId } = response.data;

    await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, newToken);
    await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, userId);
    setToken(newToken);

    const userResponse = await authAPI.getCurrentUser();
    setUser(userResponse.data);
  };

  const register = async (data: any) => {
    const response = await authAPI.register(data);
    const { token: newToken, userId } = response.data;

    await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, newToken);
    await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, userId);
    setToken(newToken);

    const userResponse = await authAPI.getCurrentUser();
    setUser(userResponse.data);
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
```

---

### Step 3: Wrap App with Providers

แก้ไขไฟล์ `app/_layout.tsx`:

```typescript
import { Stack } from "expo-router";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import "@/global.css";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </AuthProvider>
    </ThemeProvider>
  );
}
```

แก้ไข `app/index.tsx`:

```typescript
import { Redirect } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { View, ActivityIndicator } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";

export default function Index() {
  const { isAuthenticated, loading, user } = useAuth();
  const { colors } = useTheme();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // ถ้า login แล้วแต่ยัง onboarding ไม่เสร็จ
  if (isAuthenticated && user && !user.onboardingCompleted) {
    return <Redirect href="/(auth)/onboarding" />;
  }

  // ถ้า login แล้ว
  if (isAuthenticated) {
    return <Redirect href="/(tabs)/home" />;
  }

  // ถ้ายัง login
  return <Redirect href="/(auth)/login" />;
}
```

---

### Step 4: สร้าง Components พื้นฐาน

สร้างโฟลเดอร์ `components/` และสร้างไฟล์ต่อไปนี้:

#### 4.1 `components/PinkButton.tsx`

```typescript
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { Gradients, BorderRadius, Spacing } from '@/constants/Colors';

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export default function PinkButton({ title, onPress, loading, disabled, size = 'medium' }: Props) {
  const { colors, isDark } = useTheme();
  const height = size === 'small' ? 40 : size === 'large' ? 56 : 48;
  const fontSize = size === 'small' ? 14 : size === 'large' ? 18 : 16;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.button, { height, opacity: disabled ? 0.5 : 1 }]}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={isDark ? Gradients.dark.button : Gradients.light.button}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={[styles.text, { fontSize }]}>{title}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginVertical: Spacing.sm,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
```

#### 4.2 `components/ThaiInput.tsx`

```typescript
import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { BorderRadius, Spacing } from '@/constants/Colors';

interface Props {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
}

export default function ThaiInput({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry,
  keyboardType = 'default',
}: Props) {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.surface,
            borderColor: error ? colors.error : isFocused ? colors.primary : colors.border,
            color: colors.text,
          },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: Spacing.xs,
  },
  input: {
    height: 48,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
  },
  error: {
    fontSize: 12,
    marginTop: Spacing.xs,
  },
});
```

---

### Step 5: สร้าง Login Screen

แก้ไขไฟล์ `app/(auth)/login.tsx`:

```typescript
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import ThaiInput from '@/components/ThaiInput';
import PinkButton from '@/components/PinkButton';
import { Spacing } from '@/constants/Colors';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const { colors } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });

  const validate = () => {
    const newErrors = { email: '', password: '' };
    if (!email) newErrors.email = 'กรุณากรอกอีเมล';
    if (!password) newErrors.password = 'กรุณากรอกรหัสผ่าน';
    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await login(email, password);
      // AuthContext จะจัดการ redirect ใน index.tsx
    } catch (error: any) {
      Alert.alert('เข้าสู่ระบบไม่สำเร็จ', error.response?.data?.message || 'กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>เข้าสู่ระบบ</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          ยินดีต้อนรับกลับสู่ Pawmise
        </Text>

        <View style={styles.form}>
          <ThaiInput
            label="อีเมล"
            value={email}
            onChangeText={setEmail}
            placeholder="example@email.com"
            keyboardType="email-address"
            error={errors.email}
          />

          <ThaiInput
            label="รหัสผ่าน"
            value={password}
            onChangeText={setPassword}
            placeholder="รหัสผ่านของคุณ"
            secureTextEntry
            error={errors.password}
          />

          <PinkButton
            title="เข้าสู่ระบบ"
            onPress={handleLogin}
            loading={loading}
            size="large"
          />

          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={[styles.linkText, { color: colors.primary }]}>
              ยังไม่มีบัญชี? ลงทะเบียน
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.xl,
  },
  title: {
    fontSize: 40,
    fontWeight: '700',
    marginBottom: Spacing.sm,
    marginTop: Spacing.xxl,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: Spacing.xl,
  },
  form: {
    marginTop: Spacing.lg,
  },
  linkText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: Spacing.lg,
    fontWeight: '500',
  },
});
```

---

## 📝 สิ่งที่ยังต้องทำต่อ

1. ✅ **Register Screen** - คล้ายกับ Login + fields เพิ่มเติม
2. ⏳ **Onboarding Flow** - 3 steps (ข้อมูลเจ้าของ + เพิ่มแมว + สำเร็จ)
3. ⏳ **Home/Swipe Screen** - Card stack with gestures
4. ⏳ **Likes Screen** - Two tabs (ฉันถูกใจ, ถูกใจฉัน)
5. ⏳ **Messages Screen** - Chat list + Socket.io chat
6. ⏳ **Profile Screen** - แก้ไขข้อมูล + จัดการแมว

---

## 🚀 การรันโปรเจค

```bash
# Terminal 1 - Backend
cd backend_cat-tinder
npm run dev

# Terminal 2 - Frontend
cd frontend_cat-tinder
npx expo start
```

Backend: http://localhost:5000
Frontend: Expo Dev Server

---

## 📦 Dependencies ที่ต้องติดตั้งเพิ่ม

```bash
cd frontend_cat-tinder
npm install expo-linear-gradient socket.io-client react-native-gesture-handler
```

---

ทำต่อได้เลย! Design System + API Service พร้อมแล้ว 🎉
