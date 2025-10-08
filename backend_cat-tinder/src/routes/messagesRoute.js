const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const authMiddleware = require('../middleware/auth');

// ดึงข้อความทั้งหมดในการสนทนา (พร้อม pagination)
router.get('/conversation/:conversationId', authMiddleware, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // ตรวจสอบว่าผู้ใช้เป็นสมาชิกของการสนทนานี้หรือไม่
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user.userId
    });

    if (!conversation) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to conversation'
      });
    }

    // ดึงข้อความ
    const messages = await Message.find({ conversationId })
      .sort({ createdAt: -1 }) // เรียงจากใหม่ไปเก่า
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('sender', 'name profileImage')
      .lean();

    // นับจำนวนข้อความทั้งหมด
    const count = await Message.countDocuments({ conversationId });

    res.json({
      success: true,
      messages: messages.reverse(), // กลับให้เรียงจากเก่าไปใหม่
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
});

// ดึงข้อความที่ยังไม่ได้อ่าน
router.get('/unread/count', authMiddleware, async (req, res) => {
  try {
    // หา conversation ทั้งหมดของผู้ใช้
    const conversations = await Conversation.find({
      participants: req.user.userId
    }).select('_id');

    const conversationIds = conversations.map(c => c._id);

    // นับข้อความที่ยังไม่ได้อ่าน
    const unreadCount = await Message.countDocuments({
      conversationId: { $in: conversationIds },
      sender: { $ne: req.user.userId },
      isRead: false
    });

    res.json({
      success: true,
      unreadCount
    });

  } catch (error) {
    console.error('Error counting unread messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to count unread messages'
    });
  }
});

// ลบข้อความ (เฉพาะผู้ส่ง)
router.delete('/:messageId', authMiddleware, async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findOne({
      _id: messageId,
      sender: req.user.userId
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found or unauthorized'
      });
    }

    // ลบข้อความ (หรือทำเป็น soft delete ก็ได้)
    await message.deleteOne();

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message'
    });
  }
});

module.exports = router;