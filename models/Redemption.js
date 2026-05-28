const mongoose = require('mongoose');

const redemptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  benefit: { type: mongoose.Schema.Types.ObjectId, ref: 'Benefit', required: true },
  tokensSpent: { type: Number, required: true },
  code: { type: String, required: true, unique: true },
  usedAt: { type: Date, default: null }, // null = no usado aún
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Redemption', redemptionSchema);
