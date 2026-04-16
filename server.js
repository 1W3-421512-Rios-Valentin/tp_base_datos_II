require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const resourceRoutes = require('./routes/resources');
const userRoutes = require('./routes/users');

const app = express();

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
// Aumentar límite de payload para imágenes base64
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Servir archivos estáticos desde la carpeta uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'StudyTree API running' });
});

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

mongoose.connect(mongoUri)
  .then(() => {
    console.log('MongoDB Atlas connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error(err));