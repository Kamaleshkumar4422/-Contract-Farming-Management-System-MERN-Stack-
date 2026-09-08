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
    console.warn(`[MongoDB] Primary connection failed: ${err.message}`);

    // In Vercel serverless functions, do not attempt to run binary daemons
    if (!process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
      console.log(`[MongoDB] Initializing automated In-Memory MongoDB fallback server for seamless local testing...`);
      try {
        const memModule = 'mongodb-memory-server';
        const { MongoMemoryServer } = require(memModule);
        const mongod = await MongoMemoryServer.create();
        const memUri = mongod.getUri();
        const memConn = await mongoose.connect(memUri);
        console.log(`[MongoDB] In-Memory MongoDB instance active at: ${memConn.connection.host}`);
      } catch (memErr) {
        console.error(`[MongoDB] In-memory fallback failed: ${memErr.message}`);
      }
    }
  }
};

module.exports = connectDB;
