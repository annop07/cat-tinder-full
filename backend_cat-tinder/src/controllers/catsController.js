const Cat = require('../models/Cat');
const Owner = require('../models/Owner');
const Swipe = require('../models/Swipe');
const { uploadToCloudinary, deleteImages } = require('../utils/imageUpload');
const { calculateDistance } = require('../utils/geolocation');

/**
 * Get cat feed for swiping
 * GET /api/cats/feed
 */
const getCatFeed = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { catId, limit = 20 } = req.query;

    // Get the cat that will be swiping
    let myCat;
    if (catId) {
      myCat = await Cat.findOne({ _id: catId, ownerId, active: true });
    } else {
      // Get first active cat if no catId provided
      myCat = await Cat.findOne({ ownerId, active: true });
    }

    if (!myCat) {
      return res.status(404).json({
        status: 'error',
        message: 'You need to add a cat first'
      });
    }

    // Get owner's location for distance calculation
    const owner = await Owner.findById(ownerId);
    if (!owner || !owner.location) {
      return res.status(400).json({
        status: 'error',
        message: 'Owner location not set'
      });
    }

    // Find cats that this cat has already swiped on
    const swipedCatIds = await Swipe.find({
      swiperCatId: myCat._id
    }).distinct('targetCatId');

    // Get all my cat IDs to exclude
    const myCatIds = await Cat.find({ ownerId, active: true }).distinct('_id');

    // Build query - opposite gender, not my cats, not swiped, within radius
    const query = {
      _id: { $nin: [...myCatIds, ...swipedCatIds] },
      ownerId: { $ne: ownerId },
      gender: myCat.gender === 'male' ? 'female' : 'male', // Opposite gender
      active: true,
      readyForBreeding: true
    };

    // Get potential matches
    const potentialCats = await Cat.find(query)
      .populate('ownerId', 'displayName avatarUrl location phone')
      .limit(parseInt(limit) * 2) // Get more for filtering by distance
      .sort({ createdAt: -1 });

    // Filter by distance (50km radius)
    const catsWithDistance = potentialCats
      .map(cat => {
        if (!cat.location || !cat.location.lat || !cat.location.lng) {
          return null;
        }

        const distance = calculateDistance(
          { lat: owner.location.lat, lng: owner.location.lng },
          { lat: cat.location.lat, lng: cat.location.lng }
        );

        if (distance === null || distance > 50) {
          return null;
        }

        return {
          ...cat.toObject(),
          distance
        };
      })
      .filter(cat => cat !== null)
      .slice(0, parseInt(limit)); // Limit to requested amount

    res.status(200).json({
      status: 'ok',
      data: {
        cats: catsWithDistance,
        myCatId: myCat._id
      }
    });

  } catch (error) {
    console.error('Get cat feed error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get my cats
 * GET /api/cats/my-cats
 */
const getMyCats = async (req, res) => {
  try {
    const cats = await Cat.find({ ownerId: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'ok',
      data: cats
    });

  } catch (error) {
    console.error('Get my cats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get single cat by ID
 * GET /api/cats/:id
 */
const getCatById = async (req, res) => {
  try {
    const cat = await Cat.findById(req.params.id)
      .populate('ownerId', 'displayName avatarUrl location phone');

    if (!cat) {
      return res.status(404).json({
        status: 'error',
        message: 'Cat not found'
      });
    }

    res.status(200).json({
      status: 'ok',
      data: cat
    });

  } catch (error) {
    console.error('Get cat by ID error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Create new cat
 * POST /api/cats
 */
const createCat = async (req, res) => {
  try {
    const {
      name,
      gender,
      ageYears,
      ageMonths,
      breed,
      color,
      traits,
      readyForBreeding,
      vaccinated,
      neutered,
      notes
    } = req.body;

    // Validate required fields
    if (!name || !gender || !breed) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: name, gender, breed'
      });
    }

    // Validate photos (at least 1, max 5)
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'At least 1 photo is required'
      });
    }

    if (req.files.length > 5) {
      return res.status(400).json({
        status: 'error',
        message: 'Maximum 5 photos allowed'
      });
    }

    // Upload photos to Cloudinary
    const photoUploadPromises = req.files.map(file =>
      uploadToCloudinary(file.buffer, 'pawmise/cats')
    );
    const uploadResults = await Promise.all(photoUploadPromises);

    const photos = uploadResults.map(result => ({
      url: result.secure_url,
      publicId: result.public_id
    }));

    // Get owner location
    const owner = await Owner.findById(req.user.id);
    if (!owner || !owner.location) {
      return res.status(400).json({
        status: 'error',
        message: 'Owner location not set'
      });
    }

    // Create cat
    const cat = await Cat.create({
      ownerId: req.user.id,
      name,
      gender,
      ageYears: ageYears || 0,
      ageMonths: ageMonths || 0,
      breed,
      color,
      traits: traits ? (Array.isArray(traits) ? traits : [traits]) : [],
      photos,
      readyForBreeding: readyForBreeding !== undefined ? readyForBreeding : true,
      vaccinated: vaccinated || false,
      neutered: neutered || false,
      notes,
      location: owner.location
    });

    res.status(201).json({
      status: 'ok',
      message: 'Cat created successfully',
      data: cat
    });

  } catch (error) {
    console.error('Create cat error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update cat
 * PUT /api/cats/:id
 */
const updateCat = async (req, res) => {
  try {
    const cat = await Cat.findById(req.params.id);

    if (!cat) {
      return res.status(404).json({
        status: 'error',
        message: 'Cat not found'
      });
    }

    // Check ownership
    if (cat.ownerId.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to update this cat'
      });
    }

    const {
      name,
      ageYears,
      ageMonths,
      breed,
      color,
      traits,
      readyForBreeding,
      vaccinated,
      neutered,
      notes,
      active
    } = req.body;

    // Update fields
    if (name) cat.name = name;
    if (ageYears !== undefined) cat.ageYears = ageYears;
    if (ageMonths !== undefined) cat.ageMonths = ageMonths;
    if (breed) cat.breed = breed;
    if (color) cat.color = color;
    if (traits) cat.traits = Array.isArray(traits) ? traits : [traits];
    if (readyForBreeding !== undefined) cat.readyForBreeding = readyForBreeding;
    if (vaccinated !== undefined) cat.vaccinated = vaccinated;
    if (neutered !== undefined) cat.neutered = neutered;
    if (notes !== undefined) cat.notes = notes;
    if (active !== undefined) cat.active = active;

    // Handle photo updates if new photos provided
    if (req.files && req.files.length > 0) {
      // Delete old photos from Cloudinary
      const oldPublicIds = cat.photos.map(photo => photo.publicId).filter(id => id);
      if (oldPublicIds.length > 0) {
        await deleteImages(oldPublicIds);
      }

      // Upload new photos
      const photoUploadPromises = req.files.map(file =>
        uploadToCloudinary(file.buffer, 'pawmise/cats')
      );
      const uploadResults = await Promise.all(photoUploadPromises);

      cat.photos = uploadResults.map(result => ({
        url: result.secure_url,
        publicId: result.public_id
      }));
    }

    await cat.save();

    res.status(200).json({
      status: 'ok',
      message: 'Cat updated successfully',
      data: cat
    });

  } catch (error) {
    console.error('Update cat error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete cat
 * DELETE /api/cats/:id
 */
const deleteCat = async (req, res) => {
  try {
    const cat = await Cat.findById(req.params.id);

    if (!cat) {
      return res.status(404).json({
        status: 'error',
        message: 'Cat not found'
      });
    }

    // Check ownership
    if (cat.ownerId.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to delete this cat'
      });
    }

    // Delete photos from Cloudinary
    const publicIds = cat.photos.map(photo => photo.publicId).filter(id => id);
    if (publicIds.length > 0) {
      await deleteImages(publicIds);
    }

    // Delete cat
    await Cat.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'ok',
      message: 'Cat deleted successfully'
    });

  } catch (error) {
    console.error('Delete cat error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getCatFeed,
  getMyCats,
  getCatById,
  createCat,
  updateCat,
  deleteCat
};
