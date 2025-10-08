import axios from "axios";
import { useFonts } from "expo-font";
import { useRouter } from "expo-router";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


const Register = () => {
  const [fontsLoaded] = useFonts({
    CatIcons: require("./assets/fonts/CatIcons.ttf"),
    PawIcons: require("../assets/fonts/PawIcons.ttf"),
    SUSEMono: require("../assets/fonts/SUSEMono.ttf"),
    Roboto: require("../assets/fonts/Roboto.ttf"),
  });

  if (!fontsLoaded) {
    return null;
  }

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

  

  const handleSubmit = () => {
    const userData = {
      name,
      email,
      phone,
      password,
      confirmPassword,
    };
    // ตรวจสอบการส่งข้อมูล
    if(nameVerify && emailVerify && passwordVerify && confirmPasswordVerify && phoneVerify){

      axios
      .post("http://192.168.1.182:5001/register", userData)
      .then((res) => {console.log(res.data)
        if(res.data.status == "ok"){
          Alert.alert("Register Successfully!!");
          router.push("/login");
        }else{
          Alert.alert(JSON.stringify(res.data));
        }

      })
      .catch((error) => console.log(error));
    }else{
      Alert.alert("Fill mandatory details")
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
                  source={require("../assets/images/cat-loft.png")}
                  className="h-12 w-12"
                  resizeMode="contain"
                />
              </View>
              <Text className="mt-6 text-2xl font-semibold text-gray-900 font-[SUSEMono]">
                Create your profile
              </Text>
              <Text className="mt-2 w-72 text-center text-sm text-gray-500">
                Join Meowth to discover the coziest spaces for you and your feline friends.
              </Text>
            </View>

            <View className="mt-10 gap-5">
              <View className="gap-2">
                <Text className="text-sm font-medium text-gray-700">Name</Text>
                <TextInput
                  className="h-12 rounded-2xl border border-pink-100 bg-white/95 px-4 text-base text-gray-900 shadow-sm"
                  placeholder="Whiskers McMeeow"
                  placeholderTextColor="#c08497"
                  value={name}
                  onChangeText={handleName}
                />
              </View>
              <View className="gap-2">
                <Text className="text-sm font-medium text-gray-700">Email</Text>
                <TextInput
                  className="h-12 rounded-2xl border border-pink-100 bg-white/95 px-4 text-base text-gray-900 shadow-sm"
                  placeholder="you@example.com"
                  placeholderTextColor="#c08497"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={handleEmail}
                />
              </View>
              <View className="gap-2">
                <Text className="text-sm font-medium text-gray-700">Phone</Text>
                <TextInput
                  className="h-12 rounded-2xl border border-pink-100 bg-white/95 px-4 text-base text-gray-900 shadow-sm"
                  placeholder="02 123 4567"
                  placeholderTextColor="#c08497"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={handlePhone}
                />
              </View>
             
              <View className="gap-2">
                <Text className="text-sm font-medium text-gray-700">Password</Text>
                <TextInput
                  className="h-12 rounded-2xl border border-pink-100 bg-white/95 px-4 text-base text-gray-900 shadow-sm"
                  placeholder="At least 8 characters"
                  placeholderTextColor="#c08497"
                  autoComplete="off"
                  textContentType="none"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={handlePassword}
                />
                <TouchableOpacity
                  className="self-end"
                  onPress={() => setShowPassword((prev) => !prev)}
                >
                  <Text className="text-xs text-primary-300">
                    {showPassword ? "Hide password" : "Show password"}
                  </Text>
                </TouchableOpacity>
              </View>
              <View className="gap-2">
                <Text className="text-sm font-medium text-gray-700">Confirm Password</Text>
                <TextInput
                  className="h-12 rounded-2xl border border-pink-100 bg-white/95 px-4 text-base text-gray-900 shadow-sm"
                  placeholder="Re-enter your password"
                  placeholderTextColor="#c08497"
                  autoComplete="off"
                  textContentType="none"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={handleConfirmPassword}
                />
                <TouchableOpacity
                  className="self-end"
                  onPress={() => setShowConfirmPassword((prev) => !prev)}
                >
                  <Text className="text-xs text-primary-300">
                    {showConfirmPassword ? "Hide password" : "Show password"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View className="mt-12">
              <Pressable
                className="rounded-2xl bg-pink-400 py-3 shadow-lg shadow-pink-200"
                android_ripple={{ color: "#f472b6" }}
                onPress={handleSubmit}
              >
                <Text className="text-center text-lg font-semibold text-white">
                  Create account
                </Text>
              </Pressable>
              <Text className="mt-3 text-center text-xs text-gray-500">
                By tapping continue you agree to our terms.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Register;