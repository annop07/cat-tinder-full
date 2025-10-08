import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
import { Asset } from "expo-asset";
import { useFonts } from "expo-font";
import { Link, useNavigation, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SvgUri } from "react-native-svg";

const Login = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [logoUri, setLogoUri] = useState<string | null>(null);

  const router = useRouter();
  

  const [fontsLoaded] = useFonts({
    CatIcons: require(".../assets/fonts/CatIcons.ttf"),
    PawIcons: require(".../assets/fonts/PawIcons.ttf"),
    SUSEMono: require(".../assets/fonts/SUSEMono.ttf"),
    Roboto: require(".../assets/fonts/Roboto.ttf"),
  });

  useEffect(() => {
    let isMounted = true;
    const asset = Asset.fromModule(require("../assets/icons/cat-logo.svg"));

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

  const onLogin = () => {
    // TODO: hook into auth workflow
    console.log("Logging In", { email, password });
    const userData = {
      email:email,
      password
    }
    axios.post("http://192.168.1.182:5001/login",userData)
    .then(res => {console.log(res.data)
      if(res.data.status === "ok"){
        Alert.alert("Login Successfully!!");
        //ใช้ AsyncStorage เก็บtokenดึงไปใช้หน้า Home
        AsyncStorage.setItem("token",res.data.data);
        router.replace("/home");
      }
    });

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
              Sign in to keep tracking cozy spaces for you and your feline companion.
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
              />
            </View>
          </View>

          <View className="mt-auto">
            <Pressable
              className="rounded-2xl bg-pink-400 py-3 shadow-lg shadow-pink-200"
              android_ripple={{ color: "#f472b6" }}
              onPress={onLogin}
            >
              <Text className="text-center text-lg font-semibold text-white">
                Log in
              </Text>
            </Pressable>
            <Text className="mt-4 text-center text-sm text-gray-500">
              You don't have an account. Let's <Link href="/register"><Text className="text-danger underline">signup</Text></Link> to join us!!
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Login;