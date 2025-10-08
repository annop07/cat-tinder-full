const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

let io;

// เก็บ mapping ระหว่าง userId กับ socketId
const userSocketMap = new Map();

const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: "*", // ในโปรดักชันควรระบุ domain ที่ชัดเจน
      methods: ["GET", "POST"]
    },
    pingTimeout: 60000, // 60 วินาที
    pingInterval: 25000 // 25 วินาที
  });

  // Middleware สำหรับ authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);
    
    // เก็บ mapping ระหว่าง userId และ socketId
    userSocketMap.set(socket.userId, socket.id);
    
    // ส่งสถานะ online ให้ผู้ใช้คนอื่น
    socket.broadcast.emit('user:online', { userId: socket.userId });

    // Join room สำหรับการสนทนา
    socket.on('conversation:join', async (conversationId) => {
      try {
        // ตรวจสอบว่าผู้ใช้เป็นสมาชิกของการสนทนานี้หรือไม่
        const conversation = await Conversation.findOne({
          _id: conversationId,
          participants: socket.userId
        });

        if (!conversation) {
          socket.emit('error', { message: 'Unauthorized access to conversation' });
          return;
        }

        socket.join(conversationId);
        console.log(`User ${socket.userId} joined conversation ${conversationId}`);
        
        // ส่งสถานะว่า join สำเร็จ
        socket.emit('conversation:joined', { conversationId });
      } catch (error) {
        console.error('Error joining conversation:', error);
        socket.emit('error', { message: 'Failed to join conversation' });
      }
    });

    // ออกจาก room
    socket.on('conversation:leave', (conversationId) => {
      socket.leave(conversationId);
      console.log(`User ${socket.userId} left conversation ${conversationId}`);
    });

    // ส่งข้อความ
    socket.on('message:send', async (data) => {
      try {
        const { conversationId, content, messageType = 'text', imageUrl } = data;

        // ตรวจสอบว่าผู้ใช้เป็นสมาชิกของการสนทนานี้หรือไม่
        const conversation = await Conversation.findOne({
          _id: conversationId,
          participants: socket.userId
        });

        if (!conversation) {
          socket.emit('error', { message: 'Unauthorized access to conversation' });
          return;
        }

        // สร้างข้อความใหม่
        const message = new Message({
          conversationId,
          sender: socket.userId,
          content,
          messageType,
          imageUrl,
          isRead: false
        });

        await message.save();

        // Populate sender information
        await message.populate('sender', 'name profileImage');

        // อัพเดท lastMessage ของ conversation
        conversation.lastMessage = message._id;
        conversation.updatedAt = new Date();
        await conversation.save();

        // ส่งข้อความไปยังทุกคนใน room (รวมตัวเอง)
        io.to(conversationId).emit('message:received', {
          message: message.toObject(),
          conversationId
        });

        // ส่งการแจ้งเตือนไปยังผู้รับที่ไม่ได้อยู่ในห้อง
        const otherParticipants = conversation.participants.filter(
          p => p.toString() !== socket.userId
        );

        for (const participantId of otherParticipants) {
          const participantSocketId = userSocketMap.get(participantId.toString());
          
          if (participantSocketId) {
            io.to(participantSocketId).emit('notification:new_message', {
              conversationId,
              message: message.toObject()
            });
          }
        }

      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // กำลังพิมพ์
    socket.on('typing:start', (data) => {
      const { conversationId } = data;
      socket.to(conversationId).emit('typing:user', {
        userId: socket.userId,
        conversationId,
        isTyping: true
      });
    });

    socket.on('typing:stop', (data) => {
      const { conversationId } = data;
      socket.to(conversationId).emit('typing:user', {
        userId: socket.userId,
        conversationId,
        isTyping: false
      });
    });

    // อ่านข้อความ
    socket.on('message:read', async (data) => {
      try {
        const { conversationId, messageIds } = data;

        // อัพเดทสถานะการอ่าน
        await Message.updateMany(
          {
            _id: { $in: messageIds },
            conversationId,
            sender: { $ne: socket.userId }
          },
          {
            $set: { isRead: true },
            $push: {
              readBy: {
                userId: socket.userId,
                readAt: new Date()
              }
            }
          }
        );

        // ส่งสถานะการอ่านไปยัง sender
        socket.to(conversationId).emit('message:read_update', {
          conversationId,
          messageIds,
          readBy: socket.userId
        });

      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
      
      // ลบ mapping
      userSocketMap.delete(socket.userId);
      
      // ส่งสถานะ offline ให้ผู้ใช้คนอื่น
      socket.broadcast.emit('user:offline', { userId: socket.userId });
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

const getUserSocketId = (userId) => {
  return userSocketMap.get(userId.toString());
};

module.exports = {
  initializeSocket,
  getIO,
  getUserSocketId
};