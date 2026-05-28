const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ['café', 'biblioteca', 'restaurante', 'bar', 'panadería', 'librería', 'otro'],
    required: true
  },
  address: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [lon, lat]
  },
  description: String,
  image: String,
  isStudyPlace: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

placeSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Place', placeSchema);
