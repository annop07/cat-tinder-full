const Swipe = require('../models/Swipe');
const Match = require('../models/Match');
const Cat = require('../models/Cat');

/**
 * Create a swipe (like or pass)
 * POST /api/swipes
 */
const createSwipe = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { swiperCatId, targetCatId, action } = req.body;

    // Validate input
    if (!swiperCatId || !targetCatId || !action) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: swiperCatId, targetCatId, action'
      });
    }

    if (!['like', 'pass'].includes(action)) {
      return res.status(400).json({
        status: 'error',
        message: 'action must be either "like" or "pass"'
      });
    }

    // Verify swiper cat belongs to this owner
    const swiperCat = await Cat.findOne({ _id: swiperCatId, ownerId });
    if (!swiperCat) {
      return res.status(403).json({
        status: 'error',
        message: 'This cat does not belong to you'
      });
    }

    // Verify target cat exists
    const targetCat = await Cat.findById(targetCatId).populate('ownerId');
    if (!targetCat) {
      return res.status(404).json({
        status: 'error',
        message: 'Target cat not found'
      });
    }

    // Create swipe
    let swipe;
    try {
      swipe = await Swipe.create({
        swiperOwnerId: ownerId,
        swiperCatId,
        targetCatId,
        action
      });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(400).json({
          status: 'error',
          message: 'You already swiped this cat'
        });
      }
      throw err;
    }

    let match = null;

    // If action is 'like', check for mutual like (Match!)
    if (action === 'like') {
      const reverseSwipe = await Swipe.findOne({
        swiperOwnerId: targetCat.ownerId._id,
        swiperCatId: targetCatId,
        targetCatId: swiperCatId,
        action: 'like'
      });

      if (reverseSwipe) {
        // Mutual like! Create match
        // Sort cat IDs to prevent duplicate matches
        const [catAId, catBId] = [swiperCatId.toString(), targetCatId.toString()].sort();
        const [ownerAId, ownerBId] = swiperCatId.toString() < targetCatId.toString()
          ? [ownerId, targetCat.ownerId._id]
          : [targetCat.ownerId._id, ownerId];

        try {
          match = await Match.create({
            catAId,
            ownerAId,
            catBId,
            ownerBId
          });

          // Populate match data
          match = await Match.findById(match._id)
            .populate('catAId', 'name gender ageYears ageMonths breed photos')
            .populate('catBId', 'name gender ageYears ageMonths breed photos')
            .populate('ownerAId', 'displayName avatarUrl location phone')
            .populate('ownerBId', 'displayName avatarUrl location phone');

          // TODO: Emit Socket.io event 'new_match' to both owners
          // io.to(ownerAId).emit('new_match', match);
          // io.to(ownerBId).emit('new_match', match);

        } catch (err) {
          // If match already exists (duplicate), just fetch it
          if (err.code === 11000) {
            match = await Match.findOne({
              $or: [
                { catAId: catAId, catBId: catBId },
                { catAId: catBId, catBId: catAId }
              ]
            })
              .populate('catAId', 'name gender ageYears ageMonths breed photos')
              .populate('catBId', 'name gender ageYears ageMonths breed photos')
              .populate('ownerAId', 'displayName avatarUrl location phone')
              .populate('ownerBId', 'displayName avatarUrl location phone');
          } else {
            throw err;
          }
        }
      }
    }

    res.status(201).json({
      status: 'ok',
      message: 'Swipe recorded successfully',
      data: {
        swipe,
        matched: !!match,
        match: match || null
      }
    });

  } catch (error) {
    console.error('Create swipe error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get likes sent by a specific cat
 * GET /api/swipes/likes-sent/:catId
 */
const getLikesSent = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { catId } = req.params;

    // Verify cat belongs to owner
    const cat = await Cat.findOne({ _id: catId, ownerId });
    if (!cat) {
      return res.status(404).json({
        status: 'error',
        message: 'Cat not found or does not belong to you'
      });
    }

    // Get all likes sent by this cat
    const swipes = await Swipe.find({
      swiperCatId: catId,
      action: 'like'
    })
      .populate({
        path: 'targetCatId',
        select: 'name gender ageYears ageMonths breed photos location',
        populate: {
          path: 'ownerId',
          select: 'displayName avatarUrl location'
        }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'ok',
      data: swipes
    });

  } catch (error) {
    console.error('Get likes sent error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get likes received by a specific cat
 * GET /api/swipes/likes-received/:catId
 */
const getLikesReceived = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { catId } = req.params;

    // Verify cat belongs to owner
    const cat = await Cat.findOne({ _id: catId, ownerId });
    if (!cat) {
      return res.status(404).json({
        status: 'error',
        message: 'Cat not found or does not belong to you'
      });
    }

    // Get all likes received by this cat
    const swipes = await Swipe.find({
      targetCatId: catId,
      action: 'like'
    })
      .populate({
        path: 'swiperCatId',
        select: 'name gender ageYears ageMonths breed photos location',
        populate: {
          path: 'ownerId',
          select: 'displayName avatarUrl location'
        }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'ok',
      data: swipes
    });

  } catch (error) {
    console.error('Get likes received error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createSwipe,
  getLikesSent,
  getLikesReceived
};
