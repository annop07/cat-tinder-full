// import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
// import { io } from 'socket.io-client';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { Alert } from 'react-native';

// const SocketContext = createContext();

// export const useSocket = () => {
//   const context = useContext(SocketContext);
//   if (!context) {
//     throw new Error('useSocket must be used within SocketProvider');
//   }
//   return context;
// };

// export const SocketProvider = ({ children }) => {
//   const [socket, setSocket] = useState(null);
//   const [isConnected, setIsConnected] = useState(false);
//   const [onlineUsers, setOnlineUsers] = useState(new Set());
//   const socketRef = useRef(null);

//   useEffect(() => {
//     initializeSocket();

//     return () => {
//       if (socketRef.current) {
//         socketRef.current.disconnect();
//       }
//     };
//   }, []);

//   const initializeSocket = async () => {
//     try {
//       // ดึง token จาก AsyncStorage
//       const token = await AsyncStorage.getItem('userToken');
      
//       if (!token) {
//         console.log('No token found, socket not initialized');
//         return;
//       }

//       // เชื่อมต่อกับ Socket.IO server
//       const newSocket = io(process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000', {
//         auth: {
//           token
//         },
//         transports: ['websocket'],
//         reconnection: true,
//         reconnectionDelay: 1000,
//         reconnectionAttempts: 5
//       });

//       socketRef.current = newSocket;

//       // Event listeners
//       newSocket.on('connect', () => {
//         console.log('Socket connected:', newSocket.id);
//         setIsConnected(true);
//         setSocket(newSocket);
//       });

//       newSocket.on('disconnect', (reason) => {
//         console.log('Socket disconnected:', reason);
//         setIsConnected(false);
//       });

//       newSocket.on('connect_error', (error) => {
//         console.error('Socket connection error:', error);
//         Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
//       });

//       // จัดการสถานะออนไลน์ของผู้ใช้
//       newSocket.on('user:online', ({ userId }) => {
//         setOnlineUsers(prev => new Set([...prev, userId]));
//       });

//       newSocket.on('user:offline', ({ userId }) => {
//         setOnlineUsers(prev => {
//           const newSet = new Set(prev);
//           newSet.delete(userId);
//           return newSet;
//         });
//       });

//     } catch (error) {
//       console.error('Error initializing socket:', error);
//     }
//   };

//   const disconnectSocket = () => {
//     if (socketRef.current) {
//       socketRef.current.disconnect();
//       setSocket(null);
//       setIsConnected(false);
//     }
//   };

//   const joinConversation = (conversationId) => {
//     if (socketRef.current && isConnected) {
//       socketRef.current.emit('conversation:join', conversationId);
//     }
//   };

//   const leaveConversation = (conversationId) => {
//     if (socketRef.current && isConnected) {
//       socketRef.current.emit('conversation:leave', conversationId);
//     }
//   };

//   const sendMessage = (conversationId, content, messageType = 'text', imageUrl = null) => {
//     if (socketRef.current && isConnected) {
//       socketRef.current.emit('message:send', {
//         conversationId,
//         content,
//         messageType,
//         imageUrl
//       });
//     }
//   };

//   const startTyping = (conversationId) => {
//     if (socketRef.current && isConnected) {
//       socketRef.current.emit('typing:start', { conversationId });
//     }
//   };

//   const stopTyping = (conversationId) => {
//     if (socketRef.current && isConnected) {
//       socketRef.current.emit('typing:stop', { conversationId });
//     }
//   };

//   const markAsRead = (conversationId, messageIds) => {
//     if (socketRef.current && isConnected) {
//       socketRef.current.emit('message:read', { conversationId, messageIds });
//     }
//   };

//   const isUserOnline = (userId) => {
//     return onlineUsers.has(userId);
//   };

//   const value = {
//     socket: socketRef.current,
//     isConnected,
//     onlineUsers,
//     joinConversation,
//     leaveConversation,
//     sendMessage,
//     startTyping,
//     stopTyping,
//     markAsRead,
//     isUserOnline,
//     disconnectSocket,
//     reconnect: initializeSocket
//   };

//   return (
//     <SocketContext.Provider value={value}>
//       {children}
//     </SocketContext.Provider>
//   );
// };