const mongoose = require('mongoose');

const ownerSchema = new mongoose.Schema({
  // Authentication
  email: { type: String, unique: true, required: true, index: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },

  // Profile information
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  displayName: { type: String, required: true },
  phone: { type: String },
  avatarUrl: String,

  // Location for matching
  location: {
    province: { type: String, default: '' },
    district: String,
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 }
  },

  // Onboarding status
  onboardingCompleted: { type: Boolean, default: false },

  // Account status
  active: { type: Boolean, default: true },
}, { timestamps: true });

// Index for geospatial queries
ownerSchema.index({ 'location.lat': 1, 'location.lng': 1 });

module.exports = mongoose.model('Owner', ownerSchema);
