import express from 'express';
const tournamentRouter = express.Router();
const multer = require('multer');
const { requireUser, requireAdmin } = require('../middlewares/authMiddleware');
const { getAllTournaments, getTournament, createTournament, joinTournament, startTournament, nextRound } = require('../controllers/tournamentController');

// this will configure multer to save uploaded files to the uploads folder
const upload = multer({ dest: 'uploads/' });

tournamentRouter.get('/', getAllTournaments);                                               // this will return all tournaments
tournamentRouter.get('/:id', getTournament);                                               // this will return one tournament by id
tournamentRouter.post('/', requireAdmin, upload.single('trophyImage'), createTournament);  // this will block non admins, and handle optional image upload
tournamentRouter.post('/:id/join', requireUser, joinTournament);                           // this will block anonymous users from joining
tournamentRouter.post('/:id/start', requireAdmin, startTournament);                        // this will randomly pair participants and create round 1 matches
tournamentRouter.post('/:id/nextround', requireAdmin, nextRound);                          // this will collect winners and create matches for the next round

export default tournamentRouter;
