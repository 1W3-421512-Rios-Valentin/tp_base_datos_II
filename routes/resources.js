const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const Resource = require('../models/Resource');
const Comment = require('../models/Comment');
const auth = require('../middleware/auth');
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Archivo requerido' });
    
    console.log('Uploading:', req.file.originalname, 'size:', req.file.size);
    
    const { title, description, category, parentId, tags } = req.body;
    const resource = new Resource({
      user: req.user._id,
      title,
      description,
      fileData: req.file.buffer,
      fileType: req.file.mimetype,
      fileName: req.file.originalname,
      category,
      parentId: parentId || null,
      tags: tags ? tags.split(',').map(t => t.trim()) : []
    });
    
    await resource.save();
    console.log('Saved, id:', resource._id);
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
      .select('-fileData')
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
      .select('-fileData')
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
    ).select('-fileData').populate('user', 'username avatar bio');
    
    if (!resource) return res.status(404).json({ message: 'No encontrado' });
    res.json(resource);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id/file', async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    
    if (!resource || !resource.fileData) {
      return res.status(404).json({ message: 'Archivo no encontrado' });
    }
    
    console.log('Serving file:', resource.fileName);
    res.set('Content-Type', resource.fileType || 'application/octet-stream');
    res.set('Content-Disposition', `attachment; filename="${resource.fileName}"`);
    res.send(resource.fileData);
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
    
    await Resource.findByIdAndDelete(req.params.id);
    await Comment.deleteMany({ resource: req.params.id });
    
    res.json({ message: 'Eliminado' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;