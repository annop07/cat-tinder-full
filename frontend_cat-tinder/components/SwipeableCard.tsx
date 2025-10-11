// components/SwipeableCard.tsx - เวอร์ชันสุดท้าย ไม่ใช้ reanimated
import React from 'react';
import {
  View,
  Text,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Cat } from '@/types';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.9;

interface SwipeableCardProps {
  cat: Cat;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  isFirst: boolean;
}

export default function SwipeableCard({ 
  cat, 
  onSwipeLeft, 
  onSwipeRight, 
  isFirst 
}: SwipeableCardProps) {
  const { colors } = useTheme();

  const getAge = () => {
    if (cat.ageYears > 0) {
      return cat.ageMonths > 0 
        ? `${cat.ageYears} ปี ${cat.ageMonths} เดือน`
        : `${cat.ageYears} ปี`;
    }
    return `${cat.ageMonths} เดือน`;
  };

  const cardStyle = {
    width: CARD_WIDTH,
    height: 600,
    position: 'absolute' as const,
    backgroundColor: colors.surface,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    zIndex: isFirst ? 2 : 1,
    transform: isFirst ? [] : [{ scale: 0.95 }],
  };

  return (
    <View style={cardStyle}>
      {/* Main Photo */}
      <View style={{ 
        height: 400, 
        overflow: 'hidden', 
        borderTopLeftRadius: 20, 
        borderTopRightRadius: 20 
      }}>
        <Image
          source={{ uri: cat.photos[0]?.url }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
      </View>

      {/* Cat Info */}
      <View style={{ padding: 20, flex: 1 }}>
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          marginBottom: 10 
        }}>
          <Text style={{ 
            color: colors.text, 
            fontSize: 28, 
            fontWeight: 'bold',
            flex: 1 
          }}>
            {cat.name}
          </Text>
          <View style={{ 
            backgroundColor: cat.gender === 'male' ? '#3b82f6' : '#ec4899',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 20,
          }}>
            <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>
              {cat.gender === 'male' ? '♂️ ผู้' : '♀️ เมีย'}
            </Text>
          </View>
        </View>

        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          marginBottom: 8 
        }}>
          <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
          <Text style={{ 
            color: colors.textSecondary, 
            marginLeft: 8, 
            fontSize: 16 
          }}>
            {getAge()}
          </Text>
        </View>

        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          marginBottom: 8 
        }}>
          <Ionicons name="paw-outline" size={16} color={colors.textSecondary} />
          <Text style={{ 
            color: colors.textSecondary, 
            marginLeft: 8, 
            fontSize: 16 
          }}>
            {cat.breed}
          </Text>
        </View>

        {cat.distance !== undefined && (
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            marginBottom: 8 
          }}>
            <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
            <Text style={{ 
              color: colors.textSecondary, 
              marginLeft: 8, 
              fontSize: 16 
            }}>
              ห่างจากคุณ {cat.distance} กม.
            </Text>
          </View>
        )}

        {cat.traits.length > 0 && (
          <View style={{ marginTop: 10 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {cat.traits.slice(0, 3).map((trait, index) => (
                <View
                  key={index}
                  style={{
                    backgroundColor: colors.primary + '20',
                    paddingHorizontal: 12,
                    paddingVertical: 4,
                    borderRadius: 12,
                    marginRight: 8,
                    marginBottom: 6,
                  }}
                >
                  <Text style={{ 
                    color: colors.primary, 
                    fontSize: 12, 
                    fontWeight: '500' 
                  }}>
                    {trait}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {cat.vaccinated && (
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            marginTop: 12,
            backgroundColor: '#10b981' + '20',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 16,
            alignSelf: 'flex-start',
          }}>
            <Ionicons name="checkmark-circle" size={16} color="#10b981" />
            <Text style={{ 
              color: '#10b981', 
              marginLeft: 6, 
              fontSize: 12, 
              fontWeight: '500' 
            }}>
              ฉีดวัคซีนแล้ว
            </Text>
          </View>
        )}
      </View>

      {/* Action Buttons - แสดงเฉพาะ card แรก */}
      {isFirst && (
        <View style={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          flexDirection: 'row',
          justifyContent: 'space-between',
          gap: 20,
        }}>
          {/* Pass Button */}
          <TouchableOpacity
            onPress={onSwipeLeft}
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: '#ef4444',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
            }}
          >
            <Ionicons name="close" size={32} color="white" />
          </TouchableOpacity>

          {/* Like Button */}
          <TouchableOpacity
            onPress={onSwipeRight}
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: '#10b981',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
            }}
          >
            <Ionicons name="heart" size={32} color="white" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}