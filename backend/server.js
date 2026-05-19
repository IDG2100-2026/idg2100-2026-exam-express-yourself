require('dotenv').config(); // this will load the .env file

const app = require('./app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 3000; // this will use the port from .env, or 3000 as fallback

// this will connect to mongo first, then start the server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
