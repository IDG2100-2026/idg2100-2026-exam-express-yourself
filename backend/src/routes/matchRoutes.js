import express from 'express';
import { setUserType, requireUser } from '../middlewares/authMiddleware.js';
import { getAllMatches, getMatch, createMatch, joinMatch, recordResult } from '../controllers/matchController.js';
import { validate } from '../validators/validate.js';


const matchRouter = express.Router();

// this will run setUserType on all match routes so we know who is making the request
matchRouter.use(setUserType); //TODO: this will be changes with JWT

matchRouter.get('/', getAllMatches);             // this will return all non anonymous matches
matchRouter.get('/:id', validate, getMatch);              // this will return one match by id
matchRouter.post('/', validate, createMatch);             // this will create a new match, anonymous and registered users can do this
matchRouter.post('/:id/join', requireUser, joinMatch); // this will block anonymous users and let a registered user join a waiting match as player2
matchRouter.patch('/:id/result', validate, recordResult); // this will save the result and update elo ratings

export default matchRouter;
