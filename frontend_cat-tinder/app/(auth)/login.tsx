import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import ThaiInput from '@/components/ThaiInput';
import PinkButton from '@/components/PinkButton';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const { colors, isDark } = useTheme();

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
    console.log('🔄 Starting login process...');
    
    await login(email.trim(), password);
    
    console.log('✅ Login successful, navigating to home');
    router.replace('/(tabs)/home');
    
  } catch (error: any) {
    console.error('❌ Login error:', error);
    
    let errorMessage = 'เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง';
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    Alert.alert('เข้าสู่ระบบไม่สำเร็จ', errorMessage);
  } finally {
    setLoading(false);
  }
};

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
      style={{ backgroundColor: isDark ? '#1a1a1a' : '#FFFFFF' }}
    >
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 justify-center px-6 py-12">
          {/* Logo & Brand */}
          <View className="items-center">
            <Image
              source={require('@/assets/images/logo.png')}
              style={{ width: 300, height: 300 }}
              resizeMode="contain"
            />
          </View>

          {/* Login Card */}
          <View 
            className="rounded-3xl p-8"
            style={{ 
              backgroundColor: isDark ? '#2a2a2a' : 'white',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 5,
            }}
          >
            <View className="mb-4">
              <ThaiInput
                label="อีเมล"
                value={email}
                onChangeText={setEmail}
                placeholder="example@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
              />
            </View>

            <View className="mb-6">
              <ThaiInput
                label="รหัสผ่าน"
                value={password}
                onChangeText={setPassword}
                placeholder="รหัสผ่านของคุณ"
                secureTextEntry
                error={errors.password}
              />
            </View>

            <TouchableOpacity 
              className="mb-6"
              onPress={() => router.push('./(auth)/forgot-password')}
            >
              <Text
                style={{ color: '#E89292' }}
                className="text-sm text-right font-medium"
              >
                ลืมรหัสผ่าน?
              </Text>
            </TouchableOpacity>

            <PinkButton
              title="เข้าสู่ระบบ"
              onPress={handleLogin}
              loading={loading}
              size="large"
              variant="gradient"
            />
          </View>

          {/* Sign Up Link */}
          <View className="flex-row justify-center items-center mt-8">
            <Text 
              style={{ color: colors.textSecondary }}
              className="text-base"
            >
              ยังไม่มีบัญชี?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text
                style={{ color: '#E89292' }}
                className="text-base font-bold"
              >
                ลงทะเบียน
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}