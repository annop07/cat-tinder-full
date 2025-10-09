import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios'; // ✅ เพิ่ม import axios
import { Asset } from "expo-asset";
import { useFonts } from "expo-font";
import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SvgUri } from "react-native-svg";

// ✅ แก้ไข API URL ให้ตรงกับ server
const API_URL = "http://192.168.1.182:5000";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const [fontsLoaded] = useFonts({
    CatIcons: require("../../assets/fonts/CatIcons.ttf"),
    PawIcons: require("../../assets/fonts/PawIcons.ttf"),
    SUSEMono: require("../../assets/fonts/SUSEMono.ttf"),
    Roboto: require("../../assets/fonts/Roboto.ttf"),
  });

  useEffect(() => {
    let isMounted = true;
    const asset = Asset.fromModule(require("../../assets/icons/cat-logo.svg"));

    const ensureAsset = async () => {
      if (!asset.localUri) {
        await asset.downloadAsync();
      }
      if (isMounted) {
        setLogoUri(asset.localUri ?? asset.uri);
      }
    };

    ensureAsset();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  const onLogin = async () => {
    if (!email || !password) {
      Alert.alert("กรอกข้อมูลไม่ครบ", "กรุณากรอกอีเมลและรหัสผ่าน");
      return;
    }

    setLoading(true);
    
    const userData = {
      email: email.trim(),
      password
    };

    try {
      // ✅ แก้ไข URL ให้ถูกต้อง
      const response = await axios.post(`${API_URL}/api/auth/login`, userData);
      
      if (response.data.status === "ok") {
        // เก็บ token
        await AsyncStorage.setItem("token", response.data.data);
        
        // เก็บข้อมูลเพิ่มเติมถ้ามี
        if (response.data.userId) {
          await AsyncStorage.setItem("userId", response.data.userId);
        }
        
        Alert.alert("สำเร็จ", "เข้าสู่ระบบสำเร็จ!");
        
        // Navigate ไปหน้า tabs
        router.replace("./(tabs)");
      } else {
        Alert.alert("เกิดข้อผิดพลาด", response.data.message || "ไม่สามารถเข้าสู่ระบบได้");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      
      let errorMessage = "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้";
      
      if (error.response) {
        // ❌ Server ตอบกลับมาแต่มี error
        errorMessage = error.response.data?.message || `เกิดข้อผิดพลาด: ${error.response.status}`;
      } else if (error.request) {
        // ❌ ส่ง request แต่ไม่ได้รับ response
        errorMessage = "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต";
      }
      
      Alert.alert("เกิดข้อผิดพลาด", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-pink-50">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View className="flex-1 px-6 py-10">
          <View className="items-center">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-pink-100 shadow-md shadow-pink-200">
              {logoUri && <SvgUri width="48" height="48" uri={logoUri} />}
            </View>
            <Text className="mt-6 text-2xl font-semibold text-gray-900 font-[Roboto]">
              Meowth
            </Text>
            <Text className="mt-2 w-64 text-center text-sm text-gray-500">
              ลงชื่อเข้าใช้เพื่อค้นหาคู่ที่ลงตัวสำหรับแมวของคุณ
            </Text>
          </View>

          <View className="mt-12 gap-5">
            <View className="gap-2">
              <Text className="text-sm font-medium text-gray-700">Email</Text>
              <TextInput
                className="h-12 rounded-2xl border border-pink-100 bg-white/90 px-4 text-base text-gray-900 shadow-sm"
                placeholder="you@example.com"
                placeholderTextColor="#c08497"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
                editable={!loading}
              />
            </View>
            <View className="gap-2">
              <Text className="text-sm font-medium text-gray-700">Password</Text>
              <TextInput
                className="h-12 rounded-2xl border border-pink-100 bg-white/90 px-4 text-base text-gray-900 shadow-sm"
                placeholder="••••••••"
                placeholderTextColor="#c08497"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                editable={!loading}
              />
            </View>
          </View>

          <View className="mt-auto">
            <Pressable
              className={`rounded-2xl py-3 shadow-lg shadow-pink-200 ${
                loading ? "bg-pink-300" : "bg-pink-400"
              }`}
              android_ripple={{ color: "#f472b6" }}
              onPress={onLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-center text-lg font-semibold text-white">
                  เข้าสู่ระบบ
                </Text>
              )}
            </Pressable>
            <Text className="mt-4 text-center text-sm text-gray-500">
              ยังไม่มีบัญชี?{" "}
              <Link href="/(auth)/register">
                <Text className="text-pink-500 underline font-semibold">
                  สมัครสมาชิก
                </Text>
              </Link>
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Login;