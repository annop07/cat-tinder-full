const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'กรุณากรอกชื่อ'],
    trim: true,
    minlength: [2, 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร']
  },
  email: {
    type: String,
    required: [true, 'กรุณากรอกอีเมล'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[\w.%+-]+@[\w.-]+\.[a-zA-Z]{2,}$/, 'รูปแบบอีเมลไม่ถูกต้อง']
  },
  phone: {
    type: String,
    required: [true, 'กรุณากรอกเบอร์โทร'],
    match: [/^0[0-9]{9}$/, 'เบอร์โทรต้องขึ้นต้นด้วย 0 และมี 10 หลัก']
  },
  password: {
    type: String,
    required: [true, 'กรุณากรอกรหัสผ่าน'],
    minlength: [8, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร']
  },
  profileImage: {
    type: String,
    default: 'https://via.placeholder.com/150'
  },
  bio: {
    type: String,
    maxlength: [500, 'คำอธิบายต้องไม่เกิน 500 ตัวอักษร']
  },
  location: {
    province: String,
    district: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
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

// Hash password ก่อนบันทึก
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method สำหรับเปรียบเทียบรหัสผ่าน
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update timestamp
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('User', userSchema);