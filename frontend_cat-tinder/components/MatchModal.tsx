import React from 'react';
import {
  View,
  Text,
  Image,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { Match } from '@/types';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface MatchModalProps {
  visible: boolean;
  match: Match | null;
  onClose: () => void;
  onSendMessage: () => void;
}

const MatchModal: React.FC<MatchModalProps> = ({
  visible,
  match,
  onClose,
  onSendMessage,
}) => {
  const { colors, isDark } = useTheme();

  if (!match) return null;

  const catA = typeof match.catAId === 'object' ? match.catAId : null;
  const catB = typeof match.catBId === 'object' ? match.catBId : null;

  if (!catA || !catB) return null;

  // Gradient colors for modal background
  const gradientColors = isDark
    ? ['#1a1a1a', '#2a2a2a', '#1a1a1a'] as const
    : ['#fef7ff', '#f3e8ff', '#fef7ff'] as const;

  // Button gradient colors
  const buttonGradientColors = isDark
    ? ['#E89292', '#D17C7C', '#C06666'] as const
    : ['#FADEE1', '#E89292', '#D17C7C'] as const;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}>
        <LinearGradient
          colors={gradientColors}
          className="rounded-3xl p-8 items-center mx-5"
          style={{ width: SCREEN_WIDTH - 40 }}
        >
          {/* Match Text */}
          <Text
            className="text-4xl font-bold mb-8 text-center"
            style={{ color: colors.primary }}
          >
            It's a Match! 🎉
          </Text>

          {/* Cat Photos */}
          <View className="flex-row items-center justify-center mb-8 gap-4">
            <View className="relative">
              <View
                className="w-32 h-32 rounded-full overflow-hidden border-4"
                style={{ borderColor: '#FF4458' }}
              >
                <Image
                  source={{ uri: catA.photos[0]?.url }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>
              <View className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 px-2 py-1 items-center">
                <Text className="text-white text-sm font-bold">{catA.name}</Text>
              </View>
            </View>

            <View
              className="w-16 h-16 rounded-full justify-center items-center"
              style={{ backgroundColor: 'rgba(255, 68, 88, 0.2)' }}
            >
              <Text className="text-4xl">💕</Text>
            </View>

            <View className="relative">
              <View
                className="w-32 h-32 rounded-full overflow-hidden border-4"
                style={{ borderColor: '#FF4458' }}
              >
                <Image
                  source={{ uri: catB.photos[0]?.url }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>
              <View className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 px-2 py-1 items-center">
                <Text className="text-white text-sm font-bold">{catB.name}</Text>
              </View>
            </View>
          </View>

          {/* Message */}
          <Text
            className="text-base text-center mb-8 leading-6"
            style={{ color: colors.textSecondary }}
          >
            คุณและเจ้าของ {catA._id === (typeof match.catAId === 'string' ? match.catAId : match.catAId._id) ? catB.name : catA.name} สนใจกัน!{'\n'}
            เริ่มแชทเพื่อนัดพบกันได้เลย
          </Text>

          {/* Buttons */}
          <View className="w-full gap-4">
            <TouchableOpacity
              onPress={onSendMessage}
              className="rounded-2xl overflow-hidden"
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={buttonGradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="py-4 items-center"
              >
                <Text className="text-white text-lg font-semibold">ส่งข้อความ</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onClose}
              className="py-4 items-center rounded-2xl border-2"
              style={{ borderColor: colors.border }}
              activeOpacity={0.8}
            >
              <Text
                className="text-lg font-semibold"
                style={{ color: colors.text }}
              >
                ดูต่อ
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
};

export default MatchModal;