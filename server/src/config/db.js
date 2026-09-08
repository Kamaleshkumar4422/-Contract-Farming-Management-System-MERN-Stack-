const mongoose = require('mongoose');

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/contract_farming';

  try {
    // Attempt standard MongoDB connection (local or Atlas) with a 3.5s timeout
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3500,
    });
    console.log(`[MongoDB] Connected successfully to: ${conn.connection.host}`);
  } catch (err) {
    console.warn(`[MongoDB] Could not connect to primary URI (${uri}): ${err.message}`);
    console.log(`[MongoDB] Initializing automated In-Memory MongoDB fallback server for seamless local testing...`);

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const memUri = mongod.getUri();
      const memConn = await mongoose.connect(memUri);
      console.log(`[MongoDB] In-Memory MongoDB instance active at: ${memConn.connection.host}`);
    } catch (memErr) {
      console.error(`[MongoDB] Fatal: Failed to initialize in-memory fallback: ${memErr.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
