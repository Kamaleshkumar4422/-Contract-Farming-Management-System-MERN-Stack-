const app = require('../server/src/server.js');
const connectDB = require('../server/src/config/db.js');

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    console.warn('Vercel DB connection warning:', err.message);
  }
  return app(req, res);
};
