const { MongoClient } = require('mongodb');
require('dotenv').config({ path: 'C:/data/studytree-app/.env' });

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, {
  serverSelectionTimeoutMS: 10000,
  family: 4,
  directConnection: false
});

async function test() {
  try {
    await client.connect();
    console.log('Conectado!');
    await client.db('test').command({ ping: 1 });
    console.log('Ping OK!');
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await client.close();
  }
}

test();