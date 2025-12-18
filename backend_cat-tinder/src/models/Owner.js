const mongoose = require('mongoose');

const ownerSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true, index: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  username: { type: String, required: true, unique: true, index: true, trim: true },
  phone: { type: String },
  avatar: {
    url: { type: String, required: true },
    publicId: String
  },
  location: {
    province: { type: String, default: '' },
    district: String,
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 }
  },
  onboardingCompleted: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  interestUsage: {
    date: { type: Date },
    count: { type: Number, default: 0 }
  }
}, { timestamps: true });

ownerSchema.index({ 'location.lat': 1, 'location.lng': 1 });

module.exports = mongoose.model('Owner', ownerSchema);
