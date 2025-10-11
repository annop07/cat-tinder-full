// app/(tabs)/messages.tsx - แก้ไข SafeAreaView
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // ✅ แก้ไข import
import { useTheme } from '@/contexts/ThemeContext';

export default function MessagesScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: colors.text, fontSize: 24, fontWeight: 'bold', marginBottom: 10 }}>
          Messages
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: 16, textAlign: 'center' }}>
          ขณะนี้ยังไม่มีข้อความ
        </Text>
      </View>
    </SafeAreaView>
  );
}