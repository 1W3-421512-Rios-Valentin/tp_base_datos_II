const mongoose = require('mongoose');

const benefitSchema = new mongoose.Schema({
  place: { type: mongoose.Schema.Types.ObjectId, ref: 'Place', required: true },
  title: { type: String, required: true },
  description: String,
  tokenCost: { type: Number, required: true, min: 1 },
  stock: { type: Number, default: null }, // null = ilimitado
  expiresAt: { type: Date, default: null }, // null = sin vencimiento
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Benefit', benefitSchema);
