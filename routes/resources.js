const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const Resource = require('../models/Resource');
const Comment = require('../models/Comment');
const auth = require('../middleware/auth');
const router = express.Router();

let gfsBucket;

function initGridFS() {
  if (!gfsBucket && mongoose.connection.db) {
    gfsBucket = new GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
    console.log('GridFS initialized');
  }
  return gfsBucket;
}

mongoose.connection.on('open', () => {
  initGridFS();
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Archivo requerido' });
    
    initGridFS();
    
    const fileId = new mongoose.Types.ObjectId();
    console.log('Uploading file:', req.file.originalname, 'size:', req.file.size);
    
    const uploadStream = gfsBucket.openUploadStream(fileId, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });
    
    uploadStream.end(req.file.buffer);
    
    await new Promise((resolve, reject) => {
      uploadStream.on('finish', resolve);
      uploadStream.on('error', reject);
    });
    
    console.log('File uploaded, fileId:', fileId.toString());

    const { title, description, category, parentId, tags } = req.body;
    const resource = new Resource({
      user: req.user._id,
      title,
      description,
      fileUrl: fileId.toString(),
      fileType: req.file.mimetype,
      fileName: req.file.originalname,
      category,
      parentId: parentId || null,
      tags: tags ? tags.split(',').map(t => t.trim()) : []
    });
    
    await resource.save();
    res.status(201).json(resource);
  } catch (err) {
    console.error('Error upload:', err);
    res.status(500).json({ message: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    const query = {};
    
    if (category) query.category = category;
    if (search) query.$text = { $search: search };
    query.isPublished = true;
    
    const resources = await Resource.find(query)
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    res.json(resources);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/liked', auth, async (req, res) => {
  try {
    const resources = await Resource.find({ likes: req.user._id })
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 });
    
    res.json(resources);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/tree', async (req, res) => {
  try {
    const { category } = req.query;
    const query = { isPublished: true };
    if (category) query.category = category;
    
    const resources = await Resource.find(query)
      .select('title category parentId createdAt fileType');
    
    res.json(resources);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('user', 'username avatar bio');
    
    if (!resource) return res.status(404).json({ message: 'No encontrado' });
    res.json(resource);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id/file', async (req, res) => {
  try {
    initGridFS();
    const objectId = new mongoose.Types.ObjectId(req.params.id);
    const files = await gfsBucket.find({ _id: objectId }).toArray();
    
    if (!files.length) {
      console.log('File not found:', req.params.id);
      return res.status(404).json({ message: 'Archivo no encontrado' });
    }
    
    const file = files[0];
    console.log('Serving file:', file.filename);
    res.set('Content-Type', file.contentType || 'application/octet-stream');
    res.set('Content-Disposition', `attachment; filename="${file.filename}"`);
    
    const downloadStream = gfsBucket.openDownloadStream(objectId);
    downloadStream.pipe(res);
  } catch (err) {
    console.error('Download error:', err);
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/like', auth, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: 'No encontrado' });
    
    const likeIndex = resource.likes.indexOf(req.user._id);
    if (likeIndex > -1) {
      resource.likes.splice(likeIndex, 1);
    } else {
      resource.likes.push(req.user._id);
    }
    
    await resource.save();
    res.json({ likes: resource.likes.length, liked: likeIndex === -1 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { text, parentComment } = req.body;
    const comment = new Comment({
      resource: req.params.id,
      user: req.user._id,
      text,
      parentComment: parentComment || null
    });
    
    await comment.save();
    await Resource.findByIdAndUpdate(req.params.id, { $inc: { commentsCount: 1 } });
    
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ resource: req.params.id })
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 });
    
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const resource = await Resource.findOne({ _id: req.params.id, user: req.user._id });
    if (!resource) return res.status(404).json({ message: 'No autorizado' });
    
    await gfsBucket.delete(new mongoose.Types.ObjectId(resource.fileUrl));
    await Resource.findByIdAndDelete(req.params.id);
    await Comment.deleteMany({ resource: req.params.id });
    
    res.json({ message: 'Eliminado' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;