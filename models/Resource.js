const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  fileData: { type: Buffer, default: null },
  fileType: { type: String, required: true },
  fileName: { type: String, required: true },
  category: { type: String, required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource', default: null },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  views: { type: Number, default: 0 },
  commentsCount: { type: Number, default: 0 },
  tags: [{ type: String }],
  isPublished: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

resourceSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Resource', resourceSchema);