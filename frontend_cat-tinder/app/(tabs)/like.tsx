import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { swipeAPI, catAPI } from '@/services/api';
import PinkButton from '@/components/PinkButton';
import type { Cat } from '@/types';

export default function LikeScreen() {
  const { user } = useAuth();
  const { colors, isDark } = useTheme();

  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [myCats, setMyCats] = useState<Cat[]>([]);
  const [selectedCat, setSelectedCat] = useState<Cat | null>(null);
  const [likesReceived, setLikesReceived] = useState<any[]>([]);
  const [likesSent, setLikesSent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedCat) {
      loadLikes();
    }
  }, [selectedCat, activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      const catsResponse = await catAPI.getMyCats();

      if (catsResponse?.status === 'ok' && catsResponse?.data?.length > 0) {
        setMyCats(catsResponse.data);
        setSelectedCat(catsResponse.data[0]); // Select first cat by default
      }
    } catch (error: any) {
      console.error('❌ Error loading cats:', error);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลแมวได้');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadLikes = async () => {
    if (!selectedCat) return;

    try {
      if (activeTab === 'received') {
        const response = await swipeAPI.getLikesReceived(selectedCat._id);
        if (response?.status === 'ok') {
          setLikesReceived(response.data || []);
        }
      } else {
        const response = await swipeAPI.getLikesSent(selectedCat._id);
        if (response?.status === 'ok') {
          setLikesSent(response.data || []);
        }
      }
    } catch (error: any) {
      console.error('❌ Error loading likes:', error);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleLikeBack = async (targetCatId: string) => {
    if (!selectedCat) return;

    try {
      await swipeAPI.createSwipe({
        swiperCatId: selectedCat._id,
        targetCatId: targetCatId,
        action: 'like'
      });

      // Refresh likes after liking back
      await loadLikes();
      Alert.alert('สำเร็จ!', 'ไลค์กลับแล้ว ❤️');
    } catch (error: any) {
      console.error('❌ Error liking back:', error);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถไลค์กลับได้');
    }
  };

  if (loading) {
    return (
      <SafeAreaView
        className="flex-1 justify-center items-center"
        style={{ backgroundColor: colors.background }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.textSecondary, marginTop: 16 }}>
          กำลังโหลด...
        </Text>
      </SafeAreaView>
    );
  }

  if (myCats.length === 0) {
    return (
      <SafeAreaView
        className="flex-1 justify-center items-center px-6"
        style={{ backgroundColor: colors.background }}
      >
        <Ionicons name="heart-outline" size={64} color={colors.textSecondary} />
        <Text
          className="text-xl font-bold mt-4 mb-2 text-center"
          style={{ color: colors.text }}
        >
          ยังไม่มีแมว
        </Text>
        <Text
          className="text-base text-center mb-6"
          style={{ color: colors.textSecondary }}
        >
          เพิ่มแมวก่อนเพื่อดู likes ที่ได้รับ
        </Text>
        <PinkButton
          title="เพิ่มแมวแรก"
          onPress={() => {
            Alert.alert('Coming Soon', 'ฟีเจอร์เพิ่มแมวกำลังพัฒนา');
          }}
          size="large"
          variant="gradient"
        />
      </SafeAreaView>
    );
  }

  const currentLikes = activeTab === 'received' ? likesReceived : likesSent;

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <View className="px-6 pt-4 pb-2">
          <Text
            className="text-2xl font-bold"
            style={{ color: colors.text }}
          >
            Likes ❤️
          </Text>
        </View>

        {/* Cat Selector */}
        {myCats.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="px-6 mb-4"
          >
            {myCats.map((cat) => (
              <TouchableOpacity
                key={cat._id}
                onPress={() => setSelectedCat(cat)}
                className="mr-4 items-center"
              >
                <View
                  className="w-16 h-16 rounded-full mb-2 justify-center items-center"
                  style={{
                    backgroundColor: selectedCat?._id === cat._id
                      ? colors.primary
                      : colors.primary + '20'
                  }}
                >
                  {cat.photos && cat.photos[0] ? (
                    <Image
                      source={{ uri: cat.photos[0].url }}
                      className="w-16 h-16 rounded-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <Ionicons
                      name="heart"
                      size={24}
                      color={selectedCat?._id === cat._id ? 'white' : colors.primary}
                    />
                  )}
                </View>
                <Text
                  className="text-xs font-medium text-center"
                  style={{
                    color: selectedCat?._id === cat._id
                      ? colors.primary
                      : colors.textSecondary
                  }}
                  numberOfLines={1}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Tab Selector */}
        <View className="px-6 mb-6">
          <View
            className="flex-row rounded-2xl p-1"
            style={{ backgroundColor: colors.primary + '20' }}
          >
            <TouchableOpacity
              onPress={() => setActiveTab('received')}
              className="flex-1 py-3 px-4 rounded-xl"
              style={{
                backgroundColor: activeTab === 'received' ? colors.primary : 'transparent'
              }}
            >
              <Text
                className="text-center font-semibold"
                style={{
                  color: activeTab === 'received' ? 'white' : colors.primary
                }}
              >
                ได้รับ ({likesReceived.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('sent')}
              className="flex-1 py-3 px-4 rounded-xl"
              style={{
                backgroundColor: activeTab === 'sent' ? colors.primary : 'transparent'
              }}
            >
              <Text
                className="text-center font-semibold"
                style={{
                  color: activeTab === 'sent' ? 'white' : colors.primary
                }}
              >
                ส่งไป ({likesSent.length})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Likes List */}
        <View className="px-6">
          {currentLikes.length === 0 ? (
            <View className="items-center py-12">
              <Ionicons
                name={activeTab === 'received' ? 'heart-outline' : 'heart'}
                size={48}
                color={colors.textSecondary}
              />
              <Text
                className="text-lg font-medium mt-4 mb-2"
                style={{ color: colors.text }}
              >
                {activeTab === 'received' ? 'ยังไม่มีใครไลค์' : 'ยังไม่ได้ไลค์ใคร'}
              </Text>
              <Text
                className="text-base text-center"
                style={{ color: colors.textSecondary }}
              >
                {activeTab === 'received'
                  ? 'เมื่อมีคนไลค์แมวของคุณ จะแสดงที่นี่'
                  : 'ไลค์ที่คุณส่งให้แมวอื่น ๆ จะแสดงที่นี่'
                }
              </Text>
            </View>
          ) : (
            <View>
              {currentLikes.map((like, index) => (
                <View
                  key={like._id || index}
                  className="rounded-3xl p-4 mb-4"
                  style={{
                    backgroundColor: isDark ? '#2a2a2a' : 'white',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 3,
                  }}
                >
                  <View className="flex-row items-center">
                    {/* Cat Photo */}
                    <View
                      className="w-16 h-16 rounded-full mr-4 justify-center items-center"
                      style={{ backgroundColor: colors.primary + '20' }}
                    >
                      {like.targetCatId?.photos?.[0] || like.swiperCatId?.photos?.[0] ? (
                        <Image
                          source={{
                            uri: activeTab === 'received'
                              ? like.swiperCatId?.photos?.[0]?.url
                              : like.targetCatId?.photos?.[0]?.url
                          }}
                          className="w-16 h-16 rounded-full"
                          resizeMode="cover"
                        />
                      ) : (
                        <Ionicons name="heart" size={24} color={colors.primary} />
                      )}
                    </View>

                    {/* Cat Info */}
                    <View className="flex-1">
                      <Text
                        className="text-base font-bold"
                        style={{ color: colors.text }}
                      >
                        {activeTab === 'received'
                          ? like.swiperCatId?.name
                          : like.targetCatId?.name
                        } ❤️
                      </Text>
                      <Text
                        className="text-sm"
                        style={{ color: colors.textSecondary }}
                      >
                        {activeTab === 'received'
                          ? `ไลค์ ${selectedCat?.name}`
                          : `คุณไลค์แล้ว`
                        }
                      </Text>
                      <Text
                        className="text-xs mt-1"
                        style={{ color: colors.textSecondary }}
                      >
                        {new Date(like.createdAt).toLocaleDateString('th-TH')}
                      </Text>
                    </View>

                    {/* Action Button - only for received likes */}
                    {activeTab === 'received' && (
                      <TouchableOpacity
                        onPress={() => handleLikeBack(like.swiperCatId._id)}
                        className="px-4 py-2 rounded-full"
                        style={{ backgroundColor: colors.primary }}
                      >
                        <Text className="text-white text-sm font-medium">
                          ❤️ ไลค์กลับ
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}