require('dotenv').config(); // this will load the .env file so we can use process.env variables

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const errorHandler = require('./src/middlewares/errorMiddleware');
const { setUserType } = require('./src/middlewares/authMiddleware');

const app = express();

// this will set secure http headers automatically, helps protect against common attacks like clickjacking
app.use(helmet());

// this will allow requests from other origins, needed if the frontend runs on a different port
app.use(cors());

// this will parse incoming json bodies so we can read req.body
app.use(express.json());

// this will parse form data from requests
app.use(express.urlencoded({ extended: true }));

// this will serve uploaded files like trophy images as static files from the uploads folder
app.use('/uploads', express.static('uploads'));

// this will run on every request and attach userType and userId to req
app.use(setUserType);

// this will register all the api routes
app.use('/api/users',       require('./src/routes/userRoutes'));
app.use('/api/matches',     require('./src/routes/matchRoutes'));
app.use('/api/tournaments', require('./src/routes/tournamentRoutes'));
app.use('/api/comments',    require('./src/routes/commentRoutes'));
app.use('/api/leaderboard', require('./src/routes/leaderboardRoutes'));

// this will catch any request that does not match a route above
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// this will catch any errors passed with next(err) from controllers
app.use(errorHandler);

module.exports = app;
