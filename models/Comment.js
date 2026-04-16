const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  resource: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  parentComment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
  text: { type: String, required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

// Virtual para obtener las respuestas de un comentario
commentSchema.virtual('replies', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parentComment'
});

// Incluir virtuals al convertir a JSON
commentSchema.set('toJSON', { virtuals: true });
commentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Comment', commentSchema);