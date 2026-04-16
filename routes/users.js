const express = require('express');
const User = require('../models/User');
const Resource = require('../models/Resource');
const auth = require('../middleware/auth');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Crear directorio uploads si no existe
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

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

router.post('/upload', auth, async (req, res) => {
  try {
    const { avatar } = req.body;
    
    if (!avatar) {
      return res.status(400).json({ message: 'Avatar requerido' });
    }

    // Convertir base64 a buffer
    const matches = avatar.match(/^data:image\/(\w+);base64,(.*)$/);
    if (!matches) {
      return res.status(400).json({ message: 'Formato de imagen inválido' });
    }

    const [, ext, data] = matches;
    const buffer = Buffer.from(data, 'base64');
    const filename = `avatar-${req.user._id}-${Date.now()}.${ext}`;
    const filepath = path.join(uploadsDir, filename);

    // Guardar archivo en disco
    fs.writeFileSync(filepath, buffer);

    // URL relativa para acceder al archivo
    const avatarUrl = `/uploads/${filename}`;
    
    // Eliminar avatar anterior si existe
    if (req.user.avatar && req.user.avatar.startsWith('/uploads/')) {
      const oldFilepath = path.join(__dirname, '..', req.user.avatar);
      try {
        fs.unlinkSync(oldFilepath);
      } catch (e) {
        // Ignorar error si el archivo no existe
      }
    }

    req.user.avatar = avatarUrl;
    await req.user.save();
    
    res.json({ 
      url: avatarUrl,
      message: 'Avatar guardado correctamente'
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Error al guardar avatar: ' + err.message });
  }
});

router.put('/:id/profile', auth, async (req, res) => {
  try {
    if (req.params.id !== req.user._id.toString()) {
      return res.status(403).json({ message: 'No autorizado' });
    }
    const { username, bio, avatar } = req.body;
    if (username) {
      const existing = await User.findOne({ username });
      if (existing && existing._id.toString() !== req.user._id.toString()) {
        return res.status(400).json({ message: 'Username ya en uso' });
      }
      req.user.username = username;
    }
    if (bio !== undefined) req.user.bio = bio;
    if (avatar !== undefined) req.user.avatar = avatar;
    
    await req.user.save();
    res.json({ user: req.user.toObject() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;