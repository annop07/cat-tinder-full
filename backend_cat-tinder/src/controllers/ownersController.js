const Owner = require('../models/Owner');
const { uploadToCloudinary, deleteImage } = require('../utils/imageUpload');

/**
 * Get owner profile
 * GET /api/owners/profile
 */
const getProfile = async (req, res) => {
  try {
    const owner = await Owner.findById(req.user.id).select('-passwordHash');

    if (!owner) {
      return res.status(404).json({
        status: 'error',
        message: 'Owner not found'
      });
    }

    res.status(200).json({
      status: 'ok',
      data: owner
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update owner profile
 * PUT /api/owners/profile
 */
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, displayName, phone, location } = req.body;

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (displayName) updateData.displayName = displayName;
    if (phone) updateData.phone = phone;
    if (location) updateData.location = location;

    const owner = await Owner.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!owner) {
      return res.status(404).json({
        status: 'error',
        message: 'Owner not found'
      });
    }

    res.status(200).json({
      status: 'ok',
      message: 'Profile updated successfully',
      data: owner
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Complete onboarding
 * PUT /api/owners/onboarding
 */
const completeOnboarding = async (req, res) => {
  try {
    const { firstName, lastName, displayName, phone, location } = req.body;

    // Validate required fields for onboarding
    if (!firstName || !lastName || !displayName || !location || !location.province || !location.lat || !location.lng) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields for onboarding'
      });
    }

    const owner = await Owner.findByIdAndUpdate(
      req.user.id,
      {
        firstName,
        lastName,
        displayName,
        phone,
        location,
        onboardingCompleted: true
      },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!owner) {
      return res.status(404).json({
        status: 'error',
        message: 'Owner not found'
      });
    }

    res.status(200).json({
      status: 'ok',
      message: 'Onboarding completed successfully',
      data: owner
    });

  } catch (error) {
    console.error('Complete onboarding error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Upload avatar
 * POST /api/owners/avatar
 */
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file uploaded'
      });
    }

    // Get current owner
    const owner = await Owner.findById(req.user.id);
    if (!owner) {
      return res.status(404).json({
        status: 'error',
        message: 'Owner not found'
      });
    }

    // Delete old avatar if exists
    if (owner.avatarUrl) {
      // Extract public_id from URL (format: pawmise/avatars/xxx)
      const urlParts = owner.avatarUrl.split('/');
      const publicIdWithExt = urlParts[urlParts.length - 1];
      const publicId = `pawmise/avatars/${publicIdWithExt.split('.')[0]}`;
      await deleteImage(publicId);
    }

    // Upload new avatar to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, 'pawmise/avatars');

    // Update owner with new avatar URL
    owner.avatarUrl = result.secure_url;
    await owner.save();

    res.status(200).json({
      status: 'ok',
      message: 'Avatar uploaded successfully',
      data: {
        avatarUrl: result.secure_url
      }
    });

  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error during upload',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  completeOnboarding,
  uploadAvatar
};
