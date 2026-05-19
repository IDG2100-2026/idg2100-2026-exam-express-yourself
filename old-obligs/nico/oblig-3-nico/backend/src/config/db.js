const mongoose = require('mongoose');

// this will connect to mongodb using the url from the .env file
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
  } catch (err) {
    // this will print the error and stop the server if connection fails
    // no point running the server without a database
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
