const express = require('express');
const router = express.Router();
const Conversation = require('../models/conversationModel');
const Message = require('../models/messageModel');
const authMiddleware = require('../middleware/authMiddleware');

// สร้างการสนทนาใหม่ (เมื่อมีการ match)
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { otherUserId, cat1Id, cat2Id } = req.body;
    const userId = req.user.userId;

    // ตรวจสอบว่ามีการสนทนาอยู่แล้วหรือไม่
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, otherUserId] }
    });

    if (conversation) {
      return res.json({
        success: true,
        conversation,
        isNew: false
      });
    }

    // สร้างการสนทนาใหม่
    conversation = new Conversation({
      participants: [userId, otherUserId],
      catMatch: {
        cat1: cat1Id,
        cat2: cat2Id
      }
    });

    await conversation.save();

    // สร้างข้อความระบบ
    const systemMessage = new Message({
      conversationId: conversation._id,
      sender: userId,
      messageType: 'system',
      content: 'คุณได้จับคู่กันสำเร็จ! เริ่มต้นสนทนากันได้เลย 🐱💕'
    });

    await systemMessage.save();
    conversation.lastMessage = systemMessage._id;
    await conversation.save();

    // Populate ข้อมูล
    await conversation.populate('participants', 'name profileImage');
    await conversation.populate('catMatch.cat1 catMatch.cat2', 'name photos breed');
    await conversation.populate('lastMessage');

    res.json({
      success: true,
      conversation,
      isNew: true
    });

  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create conversation'
    });
  }
});

// ดึงการสนทนาทั้งหมดของผู้ใช้
router.get('/list', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const conversations = await Conversation.find({
      participants: userId,
      isActive: true
    })
    .sort({ updatedAt: -1 })
    .populate('participants', 'name profileImage')
    .populate('catMatch.cat1 catMatch.cat2', 'name photos breed')
    .populate('lastMessage')
    .lean();

    // นับจำนวนข้อความที่ยังไม่ได้อ่านในแต่ละการสนทนา
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Message.countDocuments({
          conversationId: conv._id,
          sender: { $ne: userId },
          isRead: false
        });

        return {
          ...conv,
          unreadCount
        };
      })
    );

    res.json({
      success: true,
      conversations: conversationsWithUnread
    });

  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations'
    });
  }
});

// ดึงรายละเอียดการสนทนา
router.get('/:conversationId', authMiddleware, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.userId;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    })
    .populate('participants', 'name profileImage')
    .populate('catMatch.cat1 catMatch.cat2', 'name photos breed age')
    .populate('lastMessage');

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    // นับจำนวนข้อความที่ยังไม่ได้อ่าน
    const unreadCount = await Message.countDocuments({
      conversationId: conversation._id,
      sender: { $ne: userId },
      isRead: false
    });

    res.json({
      success: true,
      conversation: {
        ...conversation.toObject(),
        unreadCount
      }
    });

  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversation'
    });
  }
});

// ลบการสนทนา (soft delete)
router.delete('/:conversationId', authMiddleware, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.userId;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    conversation.isActive = false;
    await conversation.save();

    res.json({
      success: true,
      message: 'Conversation deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete conversation'
    });
  }
});

module.exports = router;