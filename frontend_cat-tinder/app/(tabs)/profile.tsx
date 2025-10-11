import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { ownerAPI, catAPI } from '@/services/api';
import PinkButton from '@/components/PinkButton';
import ThaiInput from '@/components/ThaiInput';
import AddCatModal from '@/components/AddCatModal';
import CatDetailModal from '@/components/CatDetailModal';
import type { Owner, Cat } from '@/types';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { colors, isDark } = useTheme();

  const [profile, setProfile] = useState<Owner | null>(null);
  const [myCats, setMyCats] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddCatModal, setShowAddCatModal] = useState(false);
  const [selectedCat, setSelectedCat] = useState<Cat | null>(null);
  const [showCatDetailModal, setShowCatDetailModal] = useState(false);
  const [editData, setEditData] = useState({
    username: '',
    phone: '',
    location: {
      province: '',
      lat: 0,
      lng: 0
    }
  });

  useEffect(() => {
    if (user) {
      loadProfileData();
    }
  }, [user]);

  const loadProfileData = async () => {
    try {
      setLoading(true);

      // Load profile และ my cats พร้อมกัน
      const [profileResponse, catsResponse] = await Promise.all([
        ownerAPI.getProfile(),
        catAPI.getMyCats()
      ]);

      console.log('📊 Profile data:', profileResponse);
      console.log('🐱 My cats:', catsResponse);

      if (profileResponse?.status === 'ok' && profileResponse?.data) {
        setProfile(profileResponse.data);
        // Set initial edit data
        const profileData = profileResponse.data;
        setEditData({
          username: profileData.username || '',
          phone: profileData.phone || '',
          location: {
            province: profileData.location?.province || '',
            lat: profileData.location?.lat || 0,
            lng: profileData.location?.lng || 0
          }
        });
      }

      if (catsResponse?.status === 'ok' && catsResponse?.data) {
        setMyCats(catsResponse.data);
      }
    } catch (error: any) {
      console.error('❌ Error loading profile data:', error);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลโปรไฟล์ได้');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadProfileData();
  };

  const handleLogout = () => {
    Alert.alert(
      'ออกจากระบบ',
      'คุณต้องการออกจากระบบหรือไม่?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ออกจากระบบ',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              console.log('✅ Logout completed');

              // Navigate to login page immediately after logout
              router.replace('/(auth)/login');
            } catch (error) {
              console.error('❌ Logout error:', error);
              Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถออกจากระบบได้');
            }
          }
        }
      ]
    );
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    // Reset edit data to current profile data
    const currentProfile = profile || user;
    if (currentProfile) {
      setEditData({
        username: currentProfile.username || '',
        phone: currentProfile.phone || '',
        location: {
          province: currentProfile.location?.province || '',
          lat: currentProfile.location?.lat || 0,
          lng: currentProfile.location?.lng || 0
        }
      });
    }
    setIsEditing(false);
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);

      // Validate required fields
      if (!editData.username.trim()) {
        Alert.alert('ข้อมูลไม่ครบ', 'กรุณากรอก username');
        return;
      }

      const updateData = {
        username: editData.username.trim(),
        phone: editData.phone.trim() || undefined,
        location: editData.location.province ? {
          province: editData.location.province,
          lat: editData.location.lat,
          lng: editData.location.lng
        } : undefined
      };

      const response = await ownerAPI.updateProfile(updateData);

      if (response?.status === 'ok') {
        setProfile(response.data);
        setIsEditing(false);
        Alert.alert('สำเร็จ!', 'บันทึกข้อมูลโปรไฟล์แล้ว');
      }
    } catch (error: any) {
      console.error('❌ Error updating profile:', error);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCat = () => {
    setShowAddCatModal(true);
  };

  const handleAddCatSuccess = () => {
    // Refresh cat list after successfully adding a cat
    loadProfileData();
  };

  const handleCatPress = (cat: Cat) => {
    setSelectedCat(cat);
    setShowCatDetailModal(true);
  };

  const handleCatDetailUpdate = () => {
    // Refresh cat list after cat update/delete
    loadProfileData();
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

  const currentProfile = profile || user;

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
        <View className="px-6 pt-4 pb-6">
          <View className="flex-row justify-between items-center mb-6">
            <Text
              className="text-2xl font-bold"
              style={{ color: colors.text }}
            >
              โปรไฟล์
            </Text>
            <TouchableOpacity onPress={handleLogout}>
              <Ionicons
                name="log-out-outline"
                size={24}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Profile Card */}
          <View
            className="rounded-3xl p-6 mb-6"
            style={{
              backgroundColor: isDark ? '#2a2a2a' : 'white',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            {/* Edit Icon - Top Right */}
            <View className="absolute top-4 right-4 z-10">
              <TouchableOpacity
                onPress={isEditing ? handleCancelEdit : handleEditProfile}
                className="w-10 h-10 rounded-full justify-center items-center"
                style={{ backgroundColor: colors.primary + '20' }}
              >
                <Ionicons
                  name={isEditing ? "close" : "pencil"}
                  size={20}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>

            {!isEditing ? (
              /* View Mode */
              <View className="items-center mb-6">
                <View
                  className="w-24 h-24 rounded-full mb-4 justify-center items-center"
                  style={{ backgroundColor: colors.primary + '20' }}
                >
                  {currentProfile?.avatarUrl ? (
                    <Image
                      source={{ uri: currentProfile.avatarUrl }}
                      className="w-24 h-24 rounded-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <Ionicons
                      name="person"
                      size={40}
                      color={colors.primary}
                    />
                  )}
                </View>

                <Text
                  className="text-xl font-bold mb-4"
                  style={{ color: colors.text }}
                >
                  @{currentProfile?.username || 'ไม่มีชื่อ'}
                </Text>

                {currentProfile?.location?.province && (
                  <View className="flex-row items-center mb-4">
                    <Ionicons
                      name="location-outline"
                      size={16}
                      color={colors.textSecondary}
                    />
                    <Text
                      className="text-sm ml-1"
                      style={{ color: colors.textSecondary }}
                    >
                      {currentProfile.location.province}
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              /* Edit Mode */
              <View className="pt-6">
                <Text
                  className="text-lg font-bold mb-4 text-center"
                  style={{ color: colors.text }}
                >
                  แก้ไขโปรไฟล์
                </Text>

                <View className="space-y-4">
                  <ThaiInput
                    label="Username"
                    value={editData.username}
                    onChangeText={(text) => setEditData(prev => ({ ...prev, username: text }))}
                    placeholder="username ของคุณ"
                    autoCapitalize="none"
                  />

                  <ThaiInput
                    label="เบอร์โทร (ไม่บังคับ)"
                    value={editData.phone}
                    onChangeText={(text) => setEditData(prev => ({ ...prev, phone: text }))}
                    placeholder="0812345678"
                    keyboardType="phone-pad"
                  />

                  <ThaiInput
                    label="จังหวัด (ไม่บังคับ)"
                    value={editData.location.province}
                    onChangeText={(text) => setEditData(prev => ({
                      ...prev,
                      location: { ...prev.location, province: text }
                    }))}
                    placeholder="กรุงเทพมหานคร"
                  />
                </View>

                <View className="flex-row space-x-3 mt-6">
                  <View className="flex-1">
                    <PinkButton
                      title="ยกเลิก"
                      onPress={handleCancelEdit}
                      size="medium"
                      variant="outline"
                    />
                  </View>
                  <View className="flex-1">
                    <PinkButton
                      title="บันทึก"
                      onPress={handleSaveProfile}
                      loading={loading}
                      size="medium"
                      variant="gradient"
                    />
                  </View>
                </View>
              </View>
            )}

            {/* Profile Stats - Only show when not editing */}
            {!isEditing && (
              <View className="flex-row justify-around py-4 border-t border-gray-200">
              <View className="items-center">
                <Text
                  className="text-xl font-bold"
                  style={{ color: colors.primary }}
                >
                  {myCats.length}
                </Text>
                <Text
                  className="text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  แมวของฉัน
                </Text>
              </View>
              <View className="items-center">
                <Text
                  className="text-xl font-bold"
                  style={{ color: colors.primary }}
                >
                  0
                </Text>
                <Text
                  className="text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  แมทช์
                </Text>
              </View>
              <View className="items-center">
                <Text
                  className="text-xl font-bold"
                  style={{ color: colors.primary }}
                >
                  {currentProfile?.email ? '✓' : '✗'}
                </Text>
                <Text
                  className="text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  ยืนยันอีเมล
                </Text>
              </View>
              </View>
            )}
          </View>

          {/* My Cats Section */}
          <View
            className="rounded-3xl p-6 mb-6"
            style={{
              backgroundColor: isDark ? '#2a2a2a' : 'white',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View className="flex-row justify-between items-center mb-4">
              <Text
                className="text-lg font-bold"
                style={{ color: colors.text }}
              >
                แมวของฉัน ({myCats.length})
              </Text>
              <TouchableOpacity onPress={handleAddCat}>
                <Ionicons
                  name="add-circle-outline"
                  size={24}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>

            {myCats.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="flex-row"
              >
                {myCats.map((cat, index) => (
                  <TouchableOpacity
                    key={cat._id}
                    className="mr-4 items-center"
                    style={{ width: 80 }}
                    onPress={() => handleCatPress(cat)}
                    activeOpacity={0.7}
                  >
                    <View
                      className="w-16 h-16 rounded-full mb-2 justify-center items-center"
                      style={{ backgroundColor: colors.primary + '20' }}
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
                          color={colors.primary}
                        />
                      )}
                    </View>
                    <Text
                      className="text-xs font-medium text-center"
                      style={{ color: colors.text }}
                      numberOfLines={2}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View className="items-center py-8">
                <Ionicons
                  name="heart-outline"
                  size={48}
                  color={colors.textSecondary}
                />
                <Text
                  className="text-base mt-4 mb-2"
                  style={{ color: colors.textSecondary }}
                >
                  ยังไม่มีแมว
                </Text>
                <PinkButton
                  title="เพิ่มแมวแรก"
                  onPress={handleAddCat}
                  size="small"
                  variant="gradient"
                />
              </View>
            )}
          </View>

          {/* Contact Info */}
          {(currentProfile?.email || currentProfile?.phone) && (
            <View
              className="rounded-3xl p-6"
              style={{
                backgroundColor: isDark ? '#2a2a2a' : 'white',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <Text
                className="text-lg font-bold mb-4"
                style={{ color: colors.text }}
              >
                ข้อมูลการติดต่อ
              </Text>

              {currentProfile?.email && (
                <View className="flex-row items-center mb-3">
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={colors.textSecondary}
                  />
                  <Text
                    className="text-base ml-3"
                    style={{ color: colors.text }}
                  >
                    {currentProfile.email}
                  </Text>
                </View>
              )}

              {currentProfile?.phone && (
                <View className="flex-row items-center">
                  <Ionicons
                    name="call-outline"
                    size={20}
                    color={colors.textSecondary}
                  />
                  <Text
                    className="text-base ml-3"
                    style={{ color: colors.text }}
                  >
                    {currentProfile.phone}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Cat Modal */}
      <AddCatModal
        visible={showAddCatModal}
        onClose={() => setShowAddCatModal(false)}
        onSuccess={handleAddCatSuccess}
      />

      {/* Cat Detail Modal */}
      <CatDetailModal
        visible={showCatDetailModal}
        cat={selectedCat}
        onClose={() => {
          setShowCatDetailModal(false);
          setSelectedCat(null);
        }}
        onUpdate={handleCatDetailUpdate}
      />
    </SafeAreaView>
  );
}