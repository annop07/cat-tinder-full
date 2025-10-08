import { Stack } from "expo-router";
import "../globals.css";

export const unstable_settings = {
  initialRouteName: "login",
};

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, gestureEnabled: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="home" />
      <Stack.Screen name="index" />
    </Stack>
  );
}