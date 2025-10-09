const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, confirmPassword } = req.body;

    // Validation
    if (!name || !email || !phone || !password || !confirmPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'รหัสผ่านไม่ตรงกัน'
      });
    }

    // ตรวจสอบว่าอีเมลซ้ำหรือไม่
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'อีเมลนี้ถูกใช้งานแล้ว'
      });
    }

    // ตรวจสอบว่าเบอร์โทรซ้ำหรือไม่
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({
        status: 'error',
        message: 'เบอร์โทรนี้ถูกใช้งานแล้ว'
      });
    }

    // สร้างผู้ใช้ใหม่
    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password
    });

    await newUser.save();

    // ส่งข้อมูลกลับ (ไม่รวม password)
    const userResponse = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      profileImage: newUser.profileImage
    };

    res.status(201).json({
      status: 'ok',
      message: 'สมัครสมาชิกสำเร็จ',
      user: userResponse
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        status: 'error',
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'เกิดข้อผิดพลาดในการสมัครสมาชิก'
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'กรุณากรอกอีเมลและรหัสผ่าน'
      });
    }

    // หาผู้ใช้
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
      });
    }

    // ตรวจสอบรหัสผ่าน
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
      });
    }

    // ตรวจสอบว่าบัญชียังใช้งานอยู่หรือไม่
    if (!user.isActive) {
      return res.status(403).json({
        status: 'error',
        message: 'บัญชีนี้ถูกระงับการใช้งาน'
      });
    }

    // อัพเดท lastLogin
    user.lastLogin = new Date();
    await user.save();

    // สร้าง JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // ส่งข้อมูลกลับ
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      profileImage: user.profileImage,
      bio: user.bio
    };

    res.json({
      status: 'ok',
      message: 'เข้าสู่ระบบสำเร็จ',
      data: token,
      userId: user._id.toString(),
      user: userResponse
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ'
    });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'ไม่พบ token'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'ไม่พบผู้ใช้'
      });
    }

    res.json({
      status: 'ok',
      user
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({
      status: 'error',
      message: 'Token ไม่ถูกต้อง'
    });
  }
});

module.exports = router;