import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import ThaiInput from '@/components/ThaiInput';
import PinkButton from '@/components/PinkButton';

const Register = () => {
  const router = useRouter();
  const { register, isAuthenticated } = useAuth();
  const { colors, isDark } = useTheme();

  // Current step (1, 2, or 3)
  const [currentStep, setCurrentStep] = useState(1);

  // Form data
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  // Validate each step
  const validateStep = (step: number) => {
    const newErrors = { ...errors };
    let isValid = true;

    if (step === 1) {
      // Step 1: Name validation
      if (!firstName.trim()) {
        newErrors.firstName = 'กรุณากรอกชื่อ';
        isValid = false;
      } else {
        newErrors.firstName = '';
      }

      if (!lastName.trim()) {
        newErrors.lastName = 'กรุณากรอกนามสกุล';
        isValid = false;
      } else {
        newErrors.lastName = '';
      }
    }

    if (step === 2) {
      // Step 2: Email and Phone validation
      if (!email.trim()) {
        newErrors.email = 'กรุณากรอกอีเมล';
        isValid = false;
      } else if (!/^[\w.%+-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(email)) {
        newErrors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
        isValid = false;
      } else {
        newErrors.email = '';
      }

      if (phone && !/^0[0-9]{9}$/.test(phone)) {
        newErrors.phone = 'เบอร์โทรต้องขึ้นต้นด้วย 0 และมี 10 หลัก';
        isValid = false;
      } else {
        newErrors.phone = '';
      }
    }

    if (step === 3) {
      // Step 3: Password validation
      if (!password) {
        newErrors.password = 'กรุณากรอกรหัสผ่าน';
        isValid = false;
      } else if (password.length < 8) {
        newErrors.password = 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร';
        isValid = false;
      } else {
        newErrors.password = '';
      }

      if (!confirmPassword) {
        newErrors.confirmPassword = 'กรุณายืนยันรหัสผ่าน';
        isValid = false;
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = 'รหัสผ่านไม่ตรงกัน';
        isValid = false;
      } else {
        newErrors.confirmPassword = '';
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setLoading(true);
    try {
      const displayName = `${firstName.trim()} ${lastName.trim()}`;

      await register({
        email: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        displayName: displayName,
        phone: phone.trim() || undefined,
        location: {
          province: '',
          lat: 0,
          lng: 0,
        },
      });

      // Register สำเร็จ → ไปเพิ่มข้อมูลแมว
      router.replace('/(auth)/add-cat');
    } catch (error: any) {
      console.error('Register error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'กรุณาลองใหม่อีกครั้ง';
      Alert.alert('สมัครสมาชิกไม่สำเร็จ', errorMessage);
      setLoading(false);
    }
  };

  // Progress Indicator Component
  const ProgressIndicator = () => (
    <View className="flex-row justify-between items-center mb-8">
      {[1, 2, 3].map((step, index) => (
        <React.Fragment key={step}>
          <View className="items-center flex-1">
            <View
              className="rounded-full items-center justify-center"
              style={{
                width: 40,
                height: 40,
                backgroundColor: step <= currentStep ? colors.primary : colors.border,
              }}
            >
              {step < currentStep ? (
                <Ionicons name="checkmark" size={24} color="white" />
              ) : (
                <Text
                  className="font-bold text-base"
                  style={{
                    color: step <= currentStep ? 'white' : colors.textSecondary,
                  }}
                >
                  {step}
                </Text>
              )}
            </View>
            <Text
              className="text-xs mt-2 text-center"
              style={{
                color: step <= currentStep ? colors.primary : colors.textSecondary,
                fontWeight: step === currentStep ? 'bold' : 'normal',
              }}
            >
              {step === 1 ? 'ข้อมูลส่วนตัว' : step === 2 ? 'ติดต่อ' : 'รหัสผ่าน'}
            </Text>
          </View>
          {index < 2 && (
            <View
              className="h-0.5 flex-1 mx-2"
              style={{
                backgroundColor: step < currentStep ? colors.primary : colors.border,
                marginTop: -20,
              }}
            />
          )}
        </React.Fragment>
      ))}
    </View>
  );

  // Get step title
  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'ข้อมูลส่วนตัว';
      case 2:
        return 'ข้อมูลการติดต่อ';
      case 3:
        return 'ตั้งรหัสผ่าน';
      default:
        return '';
    }
  };

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <View>
            <ThaiInput
              label="ชื่อ"
              value={firstName}
              onChangeText={setFirstName}
              placeholder="ชื่อของคุณ"
              error={errors.firstName}
            />
            <ThaiInput
              label="นามสกุล"
              value={lastName}
              onChangeText={setLastName}
              placeholder="นามสกุล"
              error={errors.lastName}
            />
          </View>
        );

      case 2:
        return (
          <View>
            <ThaiInput
              label="อีเมล"
              value={email}
              onChangeText={setEmail}
              placeholder="example@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />
            <ThaiInput
              label="เบอร์โทร (ไม่บังคับ)"
              value={phone}
              onChangeText={setPhone}
              placeholder="0812345678"
              keyboardType="phone-pad"
              error={errors.phone}
            />
          </View>
        );

      case 3:
        return (
          <View>
            <ThaiInput
              label="รหัสผ่าน"
              value={password}
              onChangeText={setPassword}
              placeholder="อย่างน้อย 8 ตัวอักษร"
              secureTextEntry
              error={errors.password}
            />
            <ThaiInput
              label="ยืนยันรหัสผ่าน"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="กรอกรหัสผ่านอีกครั้ง"
              secureTextEntry
              error={errors.confirmPassword}
            />
          </View>
        );

      default:
        return null;
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

          {/* Register Card with Progress */}
          <View
            className="rounded-3xl p-6 mb-6"
            style={{
              backgroundColor: isDark ? '#2a2a2a' : 'white',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 5,
            }}
          >
            {/* Progress Indicator - ย้ายมาอยู่ใน Card */}
            <ProgressIndicator />

            {/* Step Title */}
            <View className="flex-row items-center mb-6">
              <View
                className="mr-3 p-2 rounded-xl"
                style={{ backgroundColor: colors.primary + '20' }}
              >
                <Ionicons
                  name={currentStep === 1 ? 'person-outline' : currentStep === 2 ? 'mail-outline' : 'lock-closed-outline'}
                  size={24}
                  color={colors.primary}
                />
              </View>
              <View className="flex-1">
                <Text style={{ color: colors.text }} className="text-xl font-bold">
                  {getStepTitle()}
                </Text>
                <Text style={{ color: colors.textSecondary }} className="text-sm">
                  ขั้นตอนที่ {currentStep} จาก 3
                </Text>
              </View>
            </View>

            {/* Form Fields */}
            {renderStepContent()}

            {/* Buttons */}
            <View className="flex-row gap-3 mt-4">
              {currentStep > 1 && (
                <View className="flex-1">
                  <PinkButton
                    title="ย้อนกลับ"
                    onPress={handleBack}
                    size="large"
                    variant="outline"
                  />
                </View>
              )}
              <View className={currentStep > 1 ? 'flex-1' : 'flex-1'}>
                {currentStep < 3 ? (
                  <PinkButton
                    title="ถัดไป"
                    onPress={handleNext}
                    size="large"
                    variant="gradient"
                  />
                ) : (
                  <PinkButton
                    title="สร้างบัญชี"
                    onPress={handleSubmit}
                    loading={loading}
                    size="large"
                    variant="gradient"
                  />
                )}
              </View>
            </View>

            {currentStep === 3 && (
              <Text
                style={{ color: colors.textSecondary }}
                className="text-xs text-center mt-4 leading-5"
              >
                เมื่อกดสร้างบัญชี แสดงว่าคุณยอมรับ{'\n'}
                ข้อกำหนดและนโยบายของเรา
              </Text>
            )}
          </View>

          {/* Login Link */}
          <View className="flex-row justify-center items-center mt-8">
            <Text
              style={{ color: colors.textSecondary }}
              className="text-base"
            >
              มีบัญชีอยู่แล้ว?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text
                style={{ color: '#E89292' }}
                className="text-base font-bold"
              >
                เข้าสู่ระบบ
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Register;