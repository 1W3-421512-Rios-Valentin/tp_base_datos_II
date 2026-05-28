require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');

const { initNeo4j } = require('./config/neo4j');
const { getRoomId, areMatched } = require('./services/chatHelpers');
const Message = require('./models/Message');
const User = require('./models/User');

const authRoutes = require('./routes/auth');
const resourceRoutes = require('./routes/resources');
const userRoutes = require('./routes/users');
const matchingRoutes = require('./routes/matching');
const walletRoutes = require('./routes/wallet');
const chatRoutes = require('./routes/chat');
const placesRoutes = require('./routes/places');
const benefitsRoutes = require('./routes/benefits');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      'http://192.168.1.19:3000',
      'http://localhost:3001',
      'http://192.168.1.19:3001'
    ],
    credentials: true
  }
});

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://192.168.1.19:3000',
    'http://localhost:3001',
    'http://192.168.1.19:3001'
  ],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/places', placesRoutes);
app.use('/api/benefits', benefitsRoutes);

app.get('/', (req, res) => res.json({ message: 'StudyTree API running' }));

// ── Socket.io ──────────────────────────────────────────────
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('No token'));
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select('-password');
    if (!user) return next(new Error('User not found'));
    socket.user = user;
    next();
  } catch {
    next(new Error('Auth error'));
  }
});

io.on('connection', (socket) => {
  // Unirse a una sala de chat
  socket.on('join_room', async ({ targetUserId }) => {
    const matched = await areMatched(socket.user._id.toString(), targetUserId).catch(() => false);
    if (!matched) return;
    const roomId = getRoomId(socket.user._id.toString(), targetUserId);
    socket.join(roomId);
  });

  // Enviar mensaje
  socket.on('send_message', async ({ targetUserId, text }) => {
    if (!text?.trim()) return;
    const matched = await areMatched(socket.user._id.toString(), targetUserId).catch(() => false);
    if (!matched) return;

    const roomId = getRoomId(socket.user._id.toString(), targetUserId);
    const msg = await Message.create({
      roomId,
      sender: socket.user._id,
      text: text.trim()
    });

    const populated = await msg.populate('sender', 'username avatar');
    io.to(roomId).emit('receive_message', populated);
  });

  // Indicador de escritura
  socket.on('typing', ({ targetUserId, isTyping }) => {
    const roomId = getRoomId(socket.user._id.toString(), targetUserId);
    socket.to(roomId).emit('user_typing', { userId: socket.user._id, isTyping });
  });
});

// ── Arranque ───────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const mongoUri = process.env.MONGO_URI || (
  process.env.MONGO_USER && process.env.MONGO_PASSWORD && process.env.MONGO_HOST
    ? `mongodb+srv://${encodeURIComponent(process.env.MONGO_USER)}:${encodeURIComponent(process.env.MONGO_PASSWORD)}@${process.env.MONGO_HOST}/${process.env.MONGO_DB || 'studytree'}?retryWrites=true&w=majority`
    : undefined
);

if (!mongoUri) {
  console.error('Falta MONGO_URI o bien MONGO_USER, MONGO_PASSWORD y MONGO_HOST en .env');
  process.exit(1);
}

async function startServer() {
  try {
    await mongoose.connect(mongoUri);
    console.log('MongoDB Atlas connected');
    await initNeo4j();
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Error al iniciar el servidor:', err);
    process.exit(1);
  }
}

startServer();
