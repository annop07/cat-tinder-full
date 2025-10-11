const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const Owner = require('../models/Owner');

/**
 * Generate JWT token
 */
const generateToken = (ownerId) => {
  return jwt.sign(
    { id: ownerId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

/**
 * Register new user with email/password
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password, username, phone, location } = req.body;

    // Check if user already exists (email or username)
    const existingOwner = await Owner.findOne({
      $or: [{ email }, { username }]
    });
    if (existingOwner) {
      if (existingOwner.email === email) {
        return res.status(400).json({
          status: 'error',
          message: 'Email already registered'
        });
      } else {
        return res.status(400).json({
          status: 'error',
          message: 'Username already taken'
        });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create new owner
    const newOwner = await Owner.create({
      email,
      passwordHash,
      username,
      phone,
      location: location || { province: '', lat: 0, lng: 0 },
      onboardingCompleted: false
    });

    // Generate token
    const token = generateToken(newOwner._id);

    res.status(201).json({
      status: 'ok',
      message: 'Registration successful',
      data: {
        token,
        userId: newOwner._id,
        onboardingCompleted: newOwner.onboardingCompleted
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Login with email/password
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find owner by email
    const owner = await Owner.findOne({ email });
    if (!owner) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // Check if owner has password (not OAuth-only account)
    if (!owner.passwordHash) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, owner.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(owner._id);

    res.status(200).json({
      status: 'ok',
      message: 'Login successful',
      data: {
        token,
        userId: owner._id,
        onboardingCompleted: owner.onboardingCompleted
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get current user info
 * GET /api/auth/me
 */
const getCurrentUser = async (req, res) => {
  try {
    const owner = await Owner.findById(req.user.id).select('-passwordHash');

    if (!owner) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'ok',
      data: owner
    });

  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Logout user
 * POST /api/auth/logout
 * No authentication required - client handles token removal
 */
const logout = async (req, res) => {
  try {
    // ดึง token จาก header (ถ้ามี) เพื่อ log แต่ไม่ validate
    const authHeader = req.headers.authorization;
    const hasToken = authHeader && authHeader.startsWith('Bearer ');

    console.log('🔐 Logout request received', hasToken ? 'with token' : 'without token');

    // ใน production สามารถเพิ่ม token blacklisting ที่นี่
    // เช่น เก็บ token ใน Redis blacklist จนกว่า token จะหมดอายุ
    // if (hasToken) {
    //   const token = authHeader.replace('Bearer ', '');
    //   await redisClient.setex(`blacklist:${token}`, tokenExpirationTime, 'true');
    // }

    res.status(200).json({
      status: 'ok',
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error during logout',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  logout
};
