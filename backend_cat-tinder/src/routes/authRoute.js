const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login, getCurrentUser } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Email/Password Authentication
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('firstName').trim().notEmpty(),
    body('lastName').trim().notEmpty(),
    body('displayName').trim().notEmpty(),
    body('location.province').optional({ checkFalsy: true }),
    body('location.lat').optional({ checkFalsy: true }).isFloat(),
    body('location.lng').optional({ checkFalsy: true }).isFloat()
  ],
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],
  login
);

// Get current user
router.get('/me', protect, getCurrentUser);

module.exports = router;
