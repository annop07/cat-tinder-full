import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  Dimensions,
  Animated,
  PanResponder,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { Cat } from '@/types';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const SWIPE_THRESHOLD = 120;

interface SwipeableCardProps {
  cat: Cat;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  isFirst: boolean;
}

const SwipeableCard: React.FC<SwipeableCardProps> = ({
  cat,
  onSwipeLeft,
  onSwipeRight,
  isFirst,
}) => {
  const { colors } = useTheme();
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const position = useRef(new Animated.ValueXY()).current;
  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const nopeOpacity = position.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => isFirst,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          forceSwipe('right');
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          forceSwipe('left');
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  const forceSwipe = (direction: 'left' | 'right') => {
    const x = direction === 'right' ? SCREEN_WIDTH + 100 : -SCREEN_WIDTH - 100;
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      position.setValue({ x: 0, y: 0 });
      if (direction === 'right') {
        onSwipeRight();
      } else {
        onSwipeLeft();
      }
    });
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
    }).start();
  };

  const handleLikePress = () => {
    forceSwipe('right');
  };

  const handlePassPress = () => {
    forceSwipe('left');
  };

  const handlePhotoTap = (side: 'left' | 'right') => {
    if (side === 'right' && currentPhotoIndex < cat.photos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
    } else if (side === 'left' && currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
    }
  };

  const owner = typeof cat.ownerId === 'object' ? cat.ownerId : null;
  const age = cat.ageYears > 0 ? `${cat.ageYears} ปี` : `${cat.ageMonths} เดือน`;
  const distanceText = cat.distance ? `${cat.distance.toFixed(1)} km` : '';

  const cardStyle = {
    ...position.getLayout(),
    transform: [{ rotate }],
  };

  return (
    <Animated.View
      {...panResponder.panHandlers}
      className={`absolute bg-white shadow-2xl overflow-hidden ${isFirst ? 'opacity-100' : 'opacity-50'}`}
      style={[
        cardStyle,
        {
          width: SCREEN_WIDTH - 40,
          height: SCREEN_HEIGHT - 200,
          borderRadius: 24,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.25,
          shadowRadius: 15,
          elevation: 10,
        }
      ]}
    >
      {/* Like Label */}
      <Animated.View
        style={{ opacity: likeOpacity }}
        className="absolute top-12 right-8 z-10 border-4 border-green-500 rounded-xl p-3 rotate-12"
      >
        <Text className="text-green-500 text-3xl font-bold">LIKE</Text>
      </Animated.View>

      {/* Nope Label */}
      <Animated.View
        style={{ opacity: nopeOpacity }}
        className="absolute top-12 left-8 z-10 border-4 border-red-500 rounded-xl p-3 -rotate-12"
      >
        <Text className="text-red-500 text-3xl font-bold">PASS</Text>
      </Animated.View>

      {/* Photo Container */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={(e) => {
          const { locationX } = e.nativeEvent;
          handlePhotoTap(locationX > SCREEN_WIDTH / 2 ? 'right' : 'left');
        }}
        className="flex-1"
      >
        <Image
          source={{ uri: cat.photos[currentPhotoIndex]?.url }}
          className="w-full h-full"
          resizeMode="cover"
        />

        {/* Photo Indicators */}
        <View className="absolute top-5 left-0 right-0 flex-row justify-center gap-1">
          {cat.photos.map((_, index) => (
            <View
              key={index}
              className="h-1 rounded-full"
              style={{
                width: 40,
                backgroundColor: index === currentPhotoIndex ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)',
              }}
            />
          ))}
        </View>

        {/* Gradient Overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          className="absolute bottom-0 left-0 right-0"
          style={{ height: 300 }}
        />
      </TouchableOpacity>

      {/* Info Section */}
      <View className="absolute bottom-0 left-0 right-0 p-6">
        <View className="flex-row items-baseline mb-1">
          <Text className="text-white text-3xl font-bold mr-3">{cat.name}</Text>
          <Text className="text-white text-2xl font-medium">{age}</Text>
        </View>

        <View className="flex-row gap-4 mb-3">
          <Text className="text-white text-base font-medium">🐱 {cat.breed}</Text>
          {distanceText && <Text className="text-white text-base font-medium">📍 {distanceText}</Text>}
        </View>

        {cat.traits.length > 0 && (
          <View className="flex-row flex-wrap gap-2 mb-3">
            {cat.traits.slice(0, 3).map((trait, index) => (
              <View key={index} className="bg-white bg-opacity-25 rounded-full px-3 py-1">
                <Text className="text-white text-sm font-semibold">
                  {getTraitEmoji(trait)} {getTraitLabel(trait)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {owner && (
          <View className="mt-1">
            <Text className="text-white text-sm opacity-90">
              เจ้าของ: {owner.displayName} • {owner.location.province}
            </Text>
          </View>
        )}
      </View>

      {/* Action Buttons (only shown on first card) */}
      {isFirst && (
        <View className="absolute -bottom-20 left-0 right-0 flex-row justify-center gap-10">
          <TouchableOpacity
            onPress={handlePassPress}
            className="w-16 h-16 rounded-full bg-red-500 justify-center items-center shadow-lg"
            activeOpacity={0.8}
          >
            <Text className="text-white text-3xl font-bold">✕</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLikePress}
            className="w-16 h-16 rounded-full bg-green-500 justify-center items-center shadow-lg"
            activeOpacity={0.8}
          >
            <Text className="text-white text-3xl font-bold">♥</Text>
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );
};

// Helper functions
const getTraitEmoji = (trait: string): string => {
  const emojiMap: Record<string, string> = {
    playful: '🎾',
    calm: '😌',
    friendly: '😊',
    shy: '🙈',
    affectionate: '💕',
    independent: '🦁',
    vocal: '🗣️',
    quiet: '🤫',
  };
  return emojiMap[trait] || '🐾';
};

const getTraitLabel = (trait: string): string => {
  const labelMap: Record<string, string> = {
    playful: 'ขี้เล่น',
    calm: 'สงบ',
    friendly: 'เป็นมิตร',
    shy: 'ขี้อาย',
    affectionate: 'ชอบลูบ',
    independent: 'อิสระ',
    vocal: 'ชอบร้อง',
    quiet: 'เงียบ',
  };
  return labelMap[trait] || trait;
};

export default SwipeableCard;