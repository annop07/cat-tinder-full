
import axios from 'axios'; // ✅ เพิ่ม import axios
import { useFonts } from "expo-font";
import { useRouter, Link } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const API_URL = "http://192.168.1.182:5000"; // ✅ เปลี่ยนเป็น port 5000

const Register = () => {
  const [fontsLoaded] = useFonts({
    CatIcons: require("../../assets/fonts/CatIcons.ttf"),
    PawIcons: require("../../assets/fonts/PawIcons.ttf"),
    SUSEMono: require("../../assets/fonts/SUSEMono.ttf"),
    Roboto: require("../../assets/fonts/Roboto.ttf"),
  });

  const router = useRouter();

  const [name, setName] = useState("");
  const [nameVerify, setNameVerify] = useState(false);
  const [email, setEmail] = useState("");
  const [emailVerify, setEmailVerify] = useState(false);
  const [phone, setPhone] = useState("");
  const [phoneVerify, setPhoneVerify] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordVerify, setPasswordVerify] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordVerify, setConfirmPasswordVerify] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!fontsLoaded) {
    return null;
  }

  const handleSubmit = async () => {
    // ตรวจสอบการกรอกข้อมูล
    if (!nameVerify || !emailVerify || !passwordVerify || !confirmPasswordVerify || !phoneVerify) {
      Alert.alert("กรอกข้อมูลไม่ครบ", "กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("รหัสผ่านไม่ตรงกัน", "กรุณาตรวจสอบรหัสผ่านอีกครั้ง");
      return;
    }

    setLoading(true);

    const userData = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password,
      confirmPassword,
    };

    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, userData);
      
      if (response.data.status === "ok") {
        Alert.alert(
          "สมัครสมาชิกสำเร็จ",
          "กรุณาเข้าสู่ระบบด้วยบัญชีของคุณ",
          [
            {
              text: "ตกลง",
              onPress: () => router.replace("/(auth)/login")
            }
          ]
        );
      } else {
        Alert.alert("เกิดข้อผิดพลาด", response.data.message || "ไม่สามารถสมัครสมาชิกได้");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      Alert.alert(
        "เกิดข้อผิดพลาด",
        error.response?.data?.message || "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleName = (text: string) => {
    setName(text);
    setNameVerify(text.trim().length > 1);
  };

  const handleEmail = (text: string) => {
    setEmail(text);
    setEmailVerify(/^[\w.%+-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(text));
  };

  const handlePhone = (text: string) => {
    setPhone(text);
    setPhoneVerify(/^0[0-9]{9}$/.test(text));
  };

  const handlePassword = (text: string) => {
    setPassword(text);
    setPasswordVerify(/(?=.*\d)(?=.*[a-z]).{8,}/.test(text));
  };

  const handleConfirmPassword = (text: string) => {
    setConfirmPassword(text);
    setConfirmPasswordVerify(text === password && /(?=.*\d)(?=.*[a-z]).{8,}/.test(text));
  };

  return (
    <SafeAreaView className="flex-1 bg-pink-50">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-6 py-10">
            <View className="items-center">
              <View className="h-16 w-16 items-center justify-center rounded-full bg-pink-100 shadow-md shadow-pink-200">
                <Image
                  source={require("../../assets/images/cat-loft.png")}
                  className="h-12 w-12"
                  resizeMode="contain"
                />
              </View>
              <Text className="mt-6 text-2xl font-semibold text-gray-900 font-[SUSEMono]">
                สร้างโปรไฟล์
              </Text>
              <Text className="mt-2 w-72 text-center text-sm text-gray-500">
                เข้าร่วม Meowth เพื่อค้นหาคู่ที่ลงตัวสำหรับแมวของคุณ
              </Text>
            </View>

            <View className="mt-10 gap-5">
              <View className="gap-2">
                <Text className="text-sm font-medium text-gray-700">ชื่อ</Text>
                <TextInput
                  className={`h-12 rounded-2xl border ${
                    name && !nameVerify ? "border-red-300" : "border-pink-100"
                  } bg-white/95 px-4 text-base text-gray-900 shadow-sm`}
                  placeholder="ชื่อของคุณ"
                  placeholderTextColor="#c08497"
                  value={name}
                  onChangeText={handleName}
                  editable={!loading}
                />
                {phone && !phoneVerify && (
                  <Text className="text-xs text-red-500">เบอร์โทรต้องขึ้นต้นด้วย 0 และมี 10 หลัก</Text>
                )}
              </View>

              <View className="gap-2">
                <Text className="text-sm font-medium text-gray-700">รหัสผ่าน</Text>
                <TextInput
                  className={`h-12 rounded-2xl border ${
                    password && !passwordVerify ? "border-red-300" : "border-pink-100"
                  } bg-white/95 px-4 text-base text-gray-900 shadow-sm`}
                  placeholder="อย่างน้อย 8 ตัวอักษร"
                  placeholderTextColor="#c08497"
                  autoComplete="off"
                  textContentType="none"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={handlePassword}
                  editable={!loading}
                />
                <TouchableOpacity
                  className="self-end"
                  onPress={() => setShowPassword((prev) => !prev)}
                >
                  <Text className="text-xs text-pink-400">
                    {showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                  </Text>
                </TouchableOpacity>
                {password && !passwordVerify && (
                  <Text className="text-xs text-red-500">
                    รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร ประกอบด้วยตัวเลขและตัวอักษร
                  </Text>
                )}
              </View>

              <View className="gap-2">
                <Text className="text-sm font-medium text-gray-700">ยืนยันรหัสผ่าน</Text>
                <TextInput
                  className={`h-12 rounded-2xl border ${
                    confirmPassword && !confirmPasswordVerify ? "border-red-300" : "border-pink-100"
                  } bg-white/95 px-4 text-base text-gray-900 shadow-sm`}
                  placeholder="กรอกรหัสผ่านอีกครั้ง"
                  placeholderTextColor="#c08497"
                  autoComplete="off"
                  textContentType="none"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={handleConfirmPassword}
                  editable={!loading}
                />
                <TouchableOpacity
                  className="self-end"
                  onPress={() => setShowConfirmPassword((prev) => !prev)}
                >
                  <Text className="text-xs text-pink-400">
                    {showConfirmPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                  </Text>
                </TouchableOpacity>
                {confirmPassword && !confirmPasswordVerify && (
                  <Text className="text-xs text-red-500">รหัสผ่านไม่ตรงกัน</Text>
                )}
              </View>
            </View>

            <View className="mt-12 mb-6">
              <Pressable
                className={`rounded-2xl py-3 shadow-lg shadow-pink-200 ${
                  loading ? "bg-pink-300" : "bg-pink-400"
                }`}
                android_ripple={{ color: "#f472b6" }}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-center text-lg font-semibold text-white">
                    สร้างบัญชี
                  </Text>
                )}
              </Pressable>
              <Text className="mt-3 text-center text-xs text-gray-500">
                เมื่อกดดำเนินการต่อ แสดงว่าคุณยอมรับข้อกำหนดของเรา
              </Text>
              <Text className="mt-4 text-center text-sm text-gray-500">
                มีบัญชีอยู่แล้ว?{" "}
                <Link href="/(auth)/login">
                  <Text className="text-pink-500 underline font-semibold">
                    เข้าสู่ระบบ
                  </Text>
                </Link>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Register;