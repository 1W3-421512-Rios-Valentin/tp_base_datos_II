require('dotenv').config({ path: 'C:/data/studytree-app/.env' });
console.log('URI:', process.env.MONGO_URI);
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected!');
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Error:', err.message);
  });