const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../utils/imageUpload');
const {
  getCatFeed,
  getMyCats,
  getCatById,
  createCat,
  updateCat,
  deleteCat
} = require('../controllers/catsController');

// All routes require authentication
router.use(protect);

// Get cat feed for swiping
router.get('/feed', getCatFeed);

// Get my cats
router.get('/my-cats', getMyCats);

// Get cat by ID
router.get('/:id', getCatById);

// Create new cat (with photo upload)
router.post('/', upload.array('photos', 5), createCat);

// Update cat
router.put('/:id', upload.array('photos', 5), updateCat);

// Delete cat
router.delete('/:id', deleteCat);

module.exports = router;
