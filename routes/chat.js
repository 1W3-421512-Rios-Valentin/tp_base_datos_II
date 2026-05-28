const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Message = require('../models/Message');
const User = require('../models/User');
const { getRoomId, areMatched } = require('../services/chatHelpers');

// GET /api/chat/conversations
// Lista todos los chats activos del usuario (último mensaje de cada room)
router.get('/conversations', auth, async (req, res) => {
  try {
    const myId = req.user._id.toString();

    // Buscar rooms donde participa el usuario
    const rooms = await Message.aggregate([
      { $match: { roomId: { $regex: myId } } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$roomId',
          lastMessage: { $first: '$text' },
          lastAt: { $first: '$createdAt' },
          lastSender: { $first: '$sender' },
          unread: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$read', false] }, { $ne: ['$sender', req.user._id] }] },
                1, 0
              ]
            }
          }
        }
      },
      { $sort: { lastAt: -1 } }
    ]);

    // Extraer el otro userId de cada roomId
    const conversations = await Promise.all(rooms.map(async (room) => {
      const otherId = room._id.split('_').find(id => id !== myId);
      const other = await User.findById(otherId).select('username avatar studyYear');
      return {
        roomId: room._id,
        other,
        lastMessage: room.lastMessage,
        lastAt: room.lastAt,
        unread: room.unread
      };
    }));

    res.json(conversations.filter(c => c.other));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/chat/:userId
// Historial de mensajes con un usuario específico
router.get('/:userId', auth, async (req, res) => {
  try {
    const matched = await areMatched(req.user._id.toString(), req.params.userId);
    if (!matched) return res.status(403).json({ message: 'No tenés match con este usuario' });

    const roomId = getRoomId(req.user._id.toString(), req.params.userId);
    const messages = await Message.find({ roomId })
      .sort({ createdAt: 1 })
      .populate('sender', 'username avatar');

    // Marcar como leídos los mensajes del otro
    await Message.updateMany(
      { roomId, sender: { $ne: req.user._id }, read: false },
      { read: true }
    );

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
