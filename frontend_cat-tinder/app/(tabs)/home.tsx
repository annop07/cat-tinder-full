import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { catAPI, swipeAPI } from '@/services/api';
import { Cat, Match, CatFeedResponse, SwipeResponse } from '@/types';
import SwipeableCard from '@/components/SwipeableCard';
import MatchModal from '@/components/MatchModal';

export default function HomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [cats, setCats] = useState<Cat[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [myCatId, setMyCatId] = useState<string | null>(null);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);

  useEffect(() => {
    loadCatFeed();
  }, []);

  const loadCatFeed = async () => {
    try {
      setLoading(true);
      const response = await catAPI.getFeed({ limit: 20 }) as unknown as CatFeedResponse;

      if (response.status === 'ok' && response.data) {
        setCats(response.data.cats || []);
        setMyCatId(response.data.myCatId);
      } else if (response.status === 'error') {
        // User might not have added a cat yet
        Alert.alert(
          'เพิ่มแมวของคุณ',
          response.message || 'คุณต้องเพิ่มโปรไฟล์แมวก่อนเริ่มหาคู่',
          [
            {
              text: 'เพิ่มแมว',
              onPress: () => router.push('/(auth)/add-cat'),
            },
            { text: 'ภายหลัง', style: 'cancel' },
          ]
        );
      }
    } catch (error: any) {
      console.error('Load cat feed error:', error);
      if (error.response && error.response.status === 404) {
        // No cats available
        Alert.alert(
          'เพิ่มแมวของคุณ',
          error.response?.data?.message || 'คุณต้องเพิ่มโปรไฟล์แมวก่อนเริ่มหาคู่',
          [
            {
              text: 'เพิ่มแมว',
              onPress: () => router.push('/(auth)/add-cat'),
            },
            { text: 'ภายหลัง', style: 'cancel' },
          ]
        );
      } else {
        Alert.alert('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (targetCatId: string, action: 'like' | 'pass') => {
    if (!myCatId) {
      Alert.alert('ข้อผิดพลาด', 'ไม่พบข้อมูลแมวของคุณ');
      return;
    }

    try {
      const response = await swipeAPI.createSwipe({
        swiperCatId: myCatId,
        targetCatId,
        action,
      }) as unknown as SwipeResponse;

      if (response.status === 'ok' && response.data) {
        // Check if it's a match
        if (response.data.matched && response.data.match) {
          setCurrentMatch(response.data.match);
          setShowMatchModal(true);
        }

        // Move to next card
        setCurrentIndex((prev) => prev + 1);

        // Load more cats if running low
        if (currentIndex >= cats.length - 3) {
          loadMoreCats();
        }
      }
    } catch (error: any) {
      console.error('Swipe error:', error);
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถบันทึกการ swipe ได้');
    }
  };

  const handleSwipeLeft = () => {
    const currentCat = cats[currentIndex];
    if (currentCat) {
      handleSwipe(currentCat._id, 'pass');
    }
  };

  const handleSwipeRight = () => {
    const currentCat = cats[currentIndex];
    if (currentCat) {
      handleSwipe(currentCat._id, 'like');
    }
  };

  const loadMoreCats = async () => {
    try {
      const response = await catAPI.getFeed({ limit: 10 }) as unknown as CatFeedResponse;
      if (response.status === 'ok' && response.data) {
        setCats((prev) => [...prev, ...(response.data?.cats || [])]);
      }
    } catch (error) {
      console.error('Load more cats error:', error);
    }
  };

  const handleCloseMatchModal = () => {
    setShowMatchModal(false);
    setCurrentMatch(null);
  };

  const handleSendMessage = () => {
    setShowMatchModal(false);
    // Navigate to messages tab and open chat with this match
    if (currentMatch?._id) {
      router.push({
        pathname: '/(tabs)/messages',
        params: { matchId: currentMatch._id },
      });
    }
    setCurrentMatch(null);
  };

  const handleRefresh = () => {
    setCurrentIndex(0);
    loadCatFeed();
  };

  if (loading) {
    return (
      <View
        className="flex-1 justify-center items-center px-8"
        style={{ backgroundColor: colors.background }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text
          className="mt-4 text-base"
          style={{ color: colors.textSecondary }}
        >
          กำลังโหลดแมวน่ารัก...
        </Text>
      </View>
    );
  }

  // No more cats available
  if (currentIndex >= cats.length) {
    return (
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: colors.background }}
      >
        <View className="flex-1 justify-center items-center px-8">
          <Text
            className="text-3xl font-bold mb-4 text-center"
            style={{ color: colors.text }}
          >
            ไม่มีแมวให้ดูแล้ว
          </Text>
          <Text
            className="text-base text-center leading-6 mb-8"
            style={{ color: colors.textSecondary }}
          >
            คุณได้ดูโปรไฟล์แมวทั้งหมดในพื้นที่ของคุณแล้ว{'\n'}
            ลองกลับมาดูใหม่ภายหลัง
          </Text>
          <TouchableOpacity
            onPress={handleRefresh}
            className="px-8 py-4 rounded-full mt-4"
            style={{ backgroundColor: colors.primary }}
          >
            <Text className="text-white text-lg font-semibold">รีเฟรช</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      {/* Header */}
      <View className="flex-row justify-between items-center px-6 py-4">
        <Text
          className="text-3xl font-bold"
          style={{ color: colors.primary }}
        >
          Pawmise
        </Text>
        <View className="flex-row items-center gap-4">
          <Text
            className="text-base font-medium"
            style={{ color: colors.textSecondary }}
          >
            {currentIndex + 1} / {cats.length}
          </Text>
        </View>
      </View>

      {/* Cards Container */}
      <View className="flex-1 justify-center items-center pb-24">
        {cats
          .slice(currentIndex, currentIndex + 3)
          .reverse()
          .map((cat, index, array) => {
            const reverseIndex = array.length - 1 - index;
            return (
              <SwipeableCard
                key={cat._id}
                cat={cat}
                onSwipeLeft={handleSwipeLeft}
                onSwipeRight={handleSwipeRight}
                isFirst={reverseIndex === 0}
              />
            );
          })}
      </View>

      {/* Match Modal */}
      <MatchModal
        visible={showMatchModal}
        match={currentMatch}
        onClose={handleCloseMatchModal}
        onSendMessage={handleSendMessage}
      />
    </SafeAreaView>
  );
}