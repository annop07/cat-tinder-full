import { Redirect } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { View, ActivityIndicator } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";

export default function Index() {
  const { isAuthenticated, loading } = useAuth();
  const { colors } = useTheme();

  // แสดง loading ขณะเช็ค auth
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Redirect โดยใช้ component แทน useEffect = ไม่มี loop
  if (isAuthenticated) {
    return <Redirect href="/(tabs)/home" />;
  }

  return <Redirect href="/(auth)/login" />;
}