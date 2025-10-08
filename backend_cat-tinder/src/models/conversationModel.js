const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  catMatch: {
    cat1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cat'
    },
    cat2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cat'
    }
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index สำหรับค้นหาการสนทนาของผู้ใช้
conversationSchema.index({ participants: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);