const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createSwipe,
  getLikesSent,
  getLikesReceived
} = require('../controllers/swipesController');

// All routes require authentication
router.use(protect);

// Create a swipe (like or pass)
router.post('/', createSwipe);

// Get likes sent by a specific cat
router.get('/likes-sent/:catId', getLikesSent);

// Get likes received by a specific cat
router.get('/likes-received/:catId', getLikesReceived);

module.exports = router;
