import { View, Text, SafeAreaView } from 'react-native';
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
          +I2A
0!2@#G'F 5I
        </Text>
      </View>
    </SafeAreaView>
  );
}
