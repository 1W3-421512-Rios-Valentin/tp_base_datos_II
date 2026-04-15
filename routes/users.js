const express = require('express');
const User = require('../models/User');
const Resource = require('../models/Resource');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    
    const resourcesCount = await Resource.countDocuments({ user: user._id, isPublished: true });
    
    res.json({ user, resourcesCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id/resources', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const resources = await Resource.find({ user: req.params.id, isPublished: true })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    res.json(resources);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/:id/follow', auth, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ message: 'Usuario no encontrado' });
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'No puedes seguirte a ti mismo' });
    }
    
    const followingIndex = req.user.following.indexOf(targetUser._id);
    if (followingIndex > -1) {
      req.user.following.splice(followingIndex, 1);
      targetUser.followers.pull(req.user._id);
    } else {
      req.user.following.push(targetUser._id);
      targetUser.followers.push(req.user._id);
    }
    
    await req.user.save();
    await targetUser.save();
    
    res.json({ 
      following: req.user.following.length, 
      followers: targetUser.followers.length,
      isFollowing: followingIndex === -1 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/profile', auth, async (req, res) => {
  try {
    const { username, bio, avatar } = req.body;
    if (username) {
      const existing = await User.findOne({ username });
      if (existing && existing._id.toString() !== req.user._id.toString()) {
        return res.status(400).json({ message: 'Username ya en uso' });
      }
      req.user.username = username;
    }
    if (bio) req.user.bio = bio;
    if (avatar) req.user.avatar = avatar;
    
    await req.user.save();
    res.json(req.user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;