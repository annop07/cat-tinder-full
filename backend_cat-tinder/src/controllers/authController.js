const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const Owner = require('../models/Owner');
const Cat = require('../models/Cat');
const Swipe = require('../models/Swipe');
const Match = require('../models/Match');
const Message = require('../models/Message');
const { uploadToCloudinary, deleteImage, deleteImages } = require('../utils/imageUpload');

const generateToken = (ownerId) => {
  return jwt.sign(
    { id: ownerId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password, username, phone, location } = req.body;

    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'Avatar image is required'
      });
    }

    const avatarUploadResult = await uploadToCloudinary(req.file.buffer, 'pawmise/avatars');

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

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newOwner = await Owner.create({
      const newOwner = await Owner.create({
        email,
        passwordHash,
        username,
        phone,
        avatar: {
          url: avatarUploadResult.secure_url,
          publicId: avatarUploadResult.public_id
        },
        location: location || { province: '', lat: 0, lng: 0 },
        onboardingCompleted: false
      });

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

      const owner = await Owner.findOne({ email });
      if (!owner) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid email or password'
        });
      }

      if (!owner.passwordHash) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid email or password'
        });
      }

      const isPasswordValid = await bcrypt.compare(password, owner.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid email or password'
        });
      }

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

  const logout = async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const hasToken = authHeader && authHeader.startsWith('Bearer ');

      console.log('🔐 Logout request received', hasToken ? 'with token' : 'without token');

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

  const deleteAccount = async (req, res) => {
    try {
      const ownerId = req.user.id;
      console.log('🗑️ Starting account deletion for user:', ownerId);

      const userCats = await Cat.find({ ownerId });
      const catIds = userCats.map(cat => cat._id);
      console.log(`🐱 Found ${userCats.length} cats to delete`);

      const imagePublicIds = [];

      userCats.forEach(cat => {
        userCats.forEach(cat => {
          if (cat.photos && cat.photos.length > 0) {
            cat.photos.forEach(photo => {
              if (photo.publicId) {
                imagePublicIds.push(photo.publicId);
              }
            });
          }
        });

        const owner = await Owner.findById(ownerId);
        if (owner && owner.avatar && owner.avatar.publicId) {
          imagePublicIds.push(owner.avatar.publicId);
        }

        const swipeDeleteResult = await Swipe.deleteMany({
          $or: [
            { swiperCatId: { $in: catIds } },
            { targetCatId: { $in: catIds } }
          ]
        });
        console.log(`🔄 Deleted ${swipeDeleteResult.deletedCount} swipes`);

        const matchesToDelete = await Match.find({
          $or: [
            { cat1Id: { $in: catIds } },
            { cat2Id: { $in: catIds } }
          ]
        });
        const matchIds = matchesToDelete.map(match => match._id);
        console.log(`💕 Found ${matchesToDelete.length} matches to delete`);

        if (matchIds.length > 0) {
          const messageDeleteResult = await Message.deleteMany({
            matchId: { $in: matchIds }
          });
          console.log(`💬 Deleted ${messageDeleteResult.deletedCount} messages`);
        }

        if (matchIds.length > 0) {
          const matchDeleteResult = await Match.deleteMany({
            _id: { $in: matchIds }
          });
          console.log(`💕 Deleted ${matchDeleteResult.deletedCount} matches`);
        }
        const catDeleteResult = await Cat.deleteMany({ ownerId });
        console.log(`🐱 Deleted ${catDeleteResult.deletedCount} cats`);

        if (imagePublicIds.length > 0) {
          try {
            console.log(`🖼️ Deleting ${imagePublicIds.length} images from Cloudinary`);
            await deleteImages(imagePublicIds);
            console.log('✅ Cloudinary images deleted successfully');
          } catch (imageError) {
            console.error('⚠️ Error deleting images from Cloudinary:', imageError);
          }
        }
        const ownerDeleteResult = await Owner.findByIdAndDelete(ownerId);
        console.log(`👤 Deleted owner:`, ownerDeleteResult ? 'success' : 'failed');

        const summary = {
          swipesDeleted: swipeDeleteResult.deletedCount,
          matchesDeleted: matchIds.length,
          messagesDeleted: matchIds.length > 0 ? await Message.countDocuments({ matchId: { $in: matchIds } }) : 0,
          catsDeleted: catDeleteResult.deletedCount,
          imagesDeleted: imagePublicIds.length,
          ownerDeleted: ownerDeleteResult ? 1 : 0
        };

        console.log('✅ Account deletion completed:', summary);

        res.status(200).json({
          status: 'ok',
          message: 'Account and all related data deleted successfully',
          data: summary
        });

      } catch (error) {
        console.error('❌ Delete account error:', error);
        res.status(500).json({
          status: 'error',
          message: 'Server error during account deletion',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
    };

    module.exports = {
      register,
      login,
      getCurrentUser,
      logout,
      deleteAccount
    };
