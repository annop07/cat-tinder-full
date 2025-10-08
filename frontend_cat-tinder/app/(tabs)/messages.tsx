// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
//   Image,
//   ActivityIndicator,
//   RefreshControl
// } from 'react-native';
// import { useSocket } from '../context/SocketContext';
// import { useFocusEffect } from '@react-navigation/native';
// import axios from 'axios';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

// const ChatListScreen = ({ navigation }) => {
//   const { socket, isConnected, isUserOnline } = useSocket();
//   const [conversations, setConversations] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [currentUserId, setCurrentUserId] = useState(null);

//   useEffect(() => {
//     initializeData();
//   }, []);

//   useFocusEffect(
//     useCallback(() => {
//       fetchConversations();
//     }, [])
//   );

//   useEffect(() => {
//     if (!socket || !isConnected) return;

//     // ฟังข้อความใหม่
//     socket.on('message:received', handleNewMessage);
    
//     // ฟังการแจ้งเตือน
//     socket.on('notification:new_message', handleNewMessageNotification);

//     return () => {
//       socket.off('message:received', handleNewMessage);
//       socket.off('notification:new_message', handleNewMessageNotification);
//     };
//   }, [socket, isConnected]);

//   const initializeData = async () => {
//     const userId = await AsyncStorage.getItem('userId');
//     setCurrentUserId(userId);
//     await fetchConversations();
//   };

//   const fetchConversations = async () => {
//     try {
//       const token = await AsyncStorage.getItem('userToken');
//       const response = await axios.get(`${API_URL}/api/conversations/list`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       setConversations(response.data.conversations);
//       setLoading(false);
//       setRefreshing(false);
//     } catch (error) {
//       console.error('Error fetching conversations:', error);
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   const handleNewMessage = ({ message, conversationId }) => {
//     setConversations(prev => {
//       const updated = prev.map(conv => {
//         if (conv._id === conversationId) {
//           return {
//             ...conv,
//             lastMessage: message,
//             updatedAt: message.createdAt,
//             unreadCount: message.sender._id !== currentUserId 
//               ? (conv.unreadCount || 0) + 1 
//               : conv.unreadCount || 0
//           };
//         }
//         return conv;
//       });

//       // เรียงใหม่ตาม updatedAt
//       return updated.sort((a, b) => 
//         new Date(b.updatedAt) - new Date(a.updatedAt)
//       );
//     });
//   };

//   const handleNewMessageNotification = ({ conversationId, message }) => {
//     handleNewMessage({ message, conversationId });
//   };

//   const onRefresh = () => {
//     setRefreshing(true);
//     fetchConversations();
//   };

//   const renderConversationItem = ({ item }) => {
//     // หาผู้ใช้อีกฝ่าย
//     const otherUser = item.participants.find(p => p._id !== currentUserId);
//     const otherCat = item.catMatch?.cat1?._id !== currentUserId 
//       ? item.catMatch?.cat1 
//       : item.catMatch?.cat2;

//     const isOnline = isUserOnline(otherUser?._id);
//     const hasUnread = item.unreadCount > 0;

//     return (
//       <TouchableOpacity
//         style={{
//           flexDirection: 'row',
//           padding: 16,
//           backgroundColor: hasUnread ? '#FFF5F7' : '#FFF',
//           borderBottomWidth: 1,
//           borderBottomColor: '#F0F0F0'
//         }}
//         onPress={() => navigation.navigate('Chat', { conversationId: item._id })}
//       >
//         {/* Profile Image */}
//         <View style={{ position: 'relative' }}>
//           <Image
//             source={{ uri: otherUser?.profileImage || 'https://via.placeholder.com/60' }}
//             style={{ width: 60, height: 60, borderRadius: 30 }}
//           />
//           {isOnline && (
//             <View
//               style={{
//                 position: 'absolute',
//                 bottom: 2,
//                 right: 2,
//                 width: 14,
//                 height: 14,
//                 borderRadius: 7,
//                 backgroundColor: '#4CAF50',
//                 borderWidth: 2,
//                 borderColor: '#FFF'
//               }}
//             />
//           )}
//         </View>

//         {/* Content */}
//         <View style={{ flex: 1, marginLeft: 12, justifyContent: 'center' }}>
//           <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
//             <Text style={{ 
//               fontSize: 16, 
//               fontWeight: hasUnread ? 'bold' : '600',
//               color: '#000',
//               flex: 1
//             }}>
//               {otherUser?.name || 'Unknown User'}
//             </Text>
//             <Text style={{ fontSize: 12, color: '#999' }}>
//               {formatTime(item.lastMessage?.createdAt || item.updatedAt)}
//             </Text>
//           </View>

//           {/* Cat Info */}
//           {otherCat && (
//             <Text style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
//               🐱 {otherCat.name} • {otherCat.breed}
//             </Text>
//           )}

//           {/* Last Message */}
//           <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
//             <Text
//               style={{
//                 fontSize: 14,
//                 color: hasUnread ? '#000' : '#666',
//                 fontWeight: hasUnread ? '600' : 'normal',
//                 flex: 1
//               }}
//               numberOfLines={1}
//             >
//               {item.lastMessage?.messageType === 'system' 
//                 ? '🔔 ' + item.lastMessage.content
//                 : item.lastMessage?.content || 'เริ่มต้นการสนทนา'}
//             </Text>
            
//             {hasUnread && (
//               <View
//                 style={{
//                   backgroundColor: '#FF6B9D',
//                   borderRadius: 10,
//                   minWidth: 20,
//                   height: 20,
//                   justifyContent: 'center',
//                   alignItems: 'center',
//                   paddingHorizontal: 6,
//                   marginLeft: 8
//                 }}
//               >
//                 <Text style={{ color: '#FFF', fontSize: 11, fontWeight: 'bold' }}>
//                   {item.unreadCount > 99 ? '99+' : item.unreadCount}
//                 </Text>
//               </View>
//             )}
//           </View>
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   const formatTime = (dateString) => {
//     if (!dateString) return '';
    
//     const date = new Date(dateString);
//     const now = new Date();
//     const diff = now - date;
//     const diffInHours = diff / (1000 * 60 * 60);
//     const diffInDays = diff / (1000 * 60 * 60 * 24);

//     if (diffInHours < 1) {
//       const minutes = Math.floor(diff / (1000 * 60));
//       return `${minutes} นาที`;
//     } else if (diffInHours < 24) {
//       return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
//     } else if (diffInDays < 7) {
//       const days = Math.floor(diffInDays);
//       return `${days} วัน`;
//     } else {
//       return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
//     }
//   };

//   if (loading) {
//     return (
//       <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' }}>
//         <ActivityIndicator size="large" color="#FF6B9D" />
//       </View>
//     );
//   }

//   return (
//     <View style={{ flex: 1, backgroundColor: '#FFF' }}>
//       {/* Header */}
//       <View style={{ 
//         padding: 16, 
//         borderBottomWidth: 1, 
//         borderBottomColor: '#EEE',
//         backgroundColor: '#FFF'
//       }}>
//         <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#000' }}>
//           แชท
//         </Text>
//         <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
//           <View style={{ 
//             width: 8, 
//             height: 8, 
//             borderRadius: 4, 
//             backgroundColor: isConnected ? '#4CAF50' : '#999',
//             marginRight: 6 
//           }} />
//           <Text style={{ fontSize: 12, color: '#666' }}>
//             {isConnected ? 'เชื่อมต่อแล้ว' : 'กำลังเชื่อมต่อ...'}
//           </Text>
//         </View>
//       </View>

//       {/* List */}
//       {conversations.length === 0 ? (
//         <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
//           <Text style={{ fontSize: 48, marginBottom: 16 }}>💬</Text>
//           <Text style={{ fontSize: 18, fontWeight: '600', color: '#000', marginBottom: 8 }}>
//             ยังไม่มีการสนทนา
//           </Text>
//           <Text style={{ fontSize: 14, color: '#666', textAlign: 'center' }}>
//             เริ่มจับคู่แมวเพื่อเริ่มการสนทนากัน!
//           </Text>
//         </View>
//       ) : (
//         <FlatList
//           data={conversations}
//           renderItem={renderConversationItem}
//           keyExtractor={(item) => item._id}
//           refreshControl={
//             <RefreshControl
//               refreshing={refreshing}
//               onRefresh={onRefresh}
//               tintColor="#FF6B9D"
//             />
//           }
//         />
//       )}
//     </View>
//   );
// };

// export default ChatListScreen;