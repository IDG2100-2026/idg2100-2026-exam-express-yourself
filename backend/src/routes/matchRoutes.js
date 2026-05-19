import express from 'express';
const matchRouter = express.Router();
const { setUserType, requireUser } = require('../middlewares/authMiddleware');
const { getAllMatches, getMatch, createMatch, joinMatch, recordResult } = require('../controllers/matchController');

// this will run setUserType on all match routes so we know who is making the request
matchRouter.use(setUserType);

matchRouter.get('/', getAllMatches);             // this will return all non anonymous matches
matchRouter.get('/:id', getMatch);              // this will return one match by id
matchRouter.post('/', createMatch);             // this will create a new match, anonymous and registered users can do this
matchRouter.post('/:id/join', requireUser, joinMatch); // this will block anonymous users and let a registered user join a waiting match as player2
matchRouter.patch('/:id/result', recordResult); // this will save the result and update elo ratings

export default matchRouter;
