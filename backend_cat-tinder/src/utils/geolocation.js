const { getDistance } = require('geolib');

/**
 * Calculate distance between two coordinates in kilometers
 * @param {Object} coords1 - {lat: number, lng: number}
 * @param {Object} coords2 - {lat: number, lng: number}
 * @returns {number} Distance in kilometers
 */
const calculateDistance = (coords1, coords2) => {
  try {
    const distanceInMeters = getDistance(
      { latitude: coords1.lat, longitude: coords1.lng },
      { latitude: coords2.lat, longitude: coords2.lng }
    );

    return Math.round(distanceInMeters / 1000); // Convert to km
  } catch (error) {
    console.error('Error calculating distance:', error);
    return null;
  }
};

/**
 * Check if two locations are within a specific radius
 * @param {Object} coords1 - {lat: number, lng: number}
 * @param {Object} coords2 - {lat: number, lng: number}
 * @param {number} radiusKm - Radius in kilometers
 * @returns {boolean}
 */
const isWithinRadius = (coords1, coords2, radiusKm = 50) => {
  const distance = calculateDistance(coords1, coords2);
  return distance !== null && distance <= radiusKm;
};

module.exports = {
  calculateDistance,
  isWithinRadius
};
