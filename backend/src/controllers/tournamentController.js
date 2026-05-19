import Tournament from '../models/Tournament.js';
import Match from '../models/Match.js';
import User from '../models/User.js';

// GET /api/tournaments?page=1&limit=10
export const getAllTournaments = async (req, res, next) => {
  try {
    // this will read pagination values from the query, defaulting to page 1 with 10 results
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit; // this will calculate how many to skip for this page

    // this will fetch all tournaments and replace ids with actual user data
    const tournaments = await Tournament.find()
      .populate('createdBy', 'username')
      .populate('winnerId', 'username')
      .skip(skip)
      .limit(limit);

    res.json({ page, limit, results: tournaments });
  } catch (err) {
    next(err);
  }
};

// GET /api/tournaments/:id
export const getTournament = async (req, res, next) => {
  try {
    // this will find one tournament and populate all the related user data
    const tournament = await Tournament.findById(req.params.id)
      .populate('createdBy', 'username')
      .populate('participants', 'username eloRating') // this will also include elo so you can see player strength
      .populate('winnerId', 'username');
    if (!tournament) return res.status(404).json({ error: 'Tournament not found' });
    res.json(tournament);
  } catch (err) {
    next(err);
  }
};

// POST /api/tournaments, admin only
export const createTournament = async (req, res, next) => {
  try {
    // this will grab all the tournament details from the request body
    const { title, description, startDate, rounds, rules, timeControl } = req.body;

    // this will set the image path if a file was uploaded, otherwise it stays null
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    // this will create and save the new tournament in the database
    const tournament = await Tournament.create({
      title,
      description,
      startDate,
      createdBy: req.userId, // this will be the admin who made the request
      category: { rounds, rules, timeControl },
      trophy: { title: req.body.trophyTitle, imageUrl },
    });
    res.status(201).json(tournament);
  } catch (err) {
    next(err);
  }
};

// POST /api/tournaments/:id/join, logged in users only
export const joinTournament = async (req, res, next) => {
  try {
    // this will find the tournament by id
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(404).json({ error: 'Tournament not found' });

    // this will stop the user from joining the same tournament twice
    if (tournament.participants.includes(req.userId)) {
      return res.status(400).json({ error: 'Already joined' });
    }

    // this will add the user to the participants array and save
    tournament.participants.push(req.userId);
    await tournament.save();
    res.json({ message: 'Joined tournament' });
  } catch (err) {
    next(err);
  }
};

// POST /api/tournaments/:id/start, admin only
export const startTournament = async (req, res, next) => {
  try {
    // this will find the tournament by id
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(404).json({ error: 'Tournament not found' });

    // this will stop the tournament from being started more than once
    if (tournament.status !== 'upcoming') {
      return res.status(400).json({ error: 'Tournament has already started' });
    }

    // this will check there are at least 2 participants to play
    if (tournament.participants.length < 2) {
      return res.status(400).json({ error: 'Need at least 2 participants to start' });
    }

    // this will randomly shuffle the participants array
    // sort with a random comparator is a simple way to shuffle
    const shuffled = [...tournament.participants].sort(() => Math.random() - 0.5);

    // this will pair up the shuffled participants into matches
    // if there is an odd number, the last player gets a bye (no match, advances automatically)
    const matches = [];
    for (let i = 0; i + 1 < shuffled.length; i += 2) {
      const match = await Match.create({
        player1: shuffled[i],
        player2: shuffled[i + 1],
        category: tournament.category, // this will use the same format as the tournament
        status: 'waiting',
        tournamentId: tournament._id,  // this will link the match back to this tournament
        round: 1,                      // this is round 1
      });
      matches.push(match._id);
    }

    // this will set the tournament to in-progress and track the current round
    tournament.status = 'in-progress';
    tournament.currentRound = 1;
    await tournament.save();

    res.json({ message: 'Tournament started', matchesCreated: matches.length, matches });
  } catch (err) {
    next(err);
  }
};

// POST /api/tournaments/:id/nextround, admin only
export const nextRound = async (req, res, next) => {
  try {
    // this will find the tournament by id
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(404).json({ error: 'Tournament not found' });

    // this will block if the tournament is not currently running
    if (tournament.status !== 'in-progress') {
      return res.status(400).json({ error: 'Tournament is not in progress' });
    }

    // this will find all matches from the current round of this tournament
    const currentMatches = await Match.find({
      tournamentId: tournament._id,
      round: tournament.currentRound,
    });

    // this will check that every match in this round is finished before moving on
    const allDone = currentMatches.every(m => m.status === 'completed');
    if (!allDone) {
      return res.status(400).json({ error: 'Not all matches in the current round are completed' });
    }

    // this will collect the winner from each match
    // if a match has no player2 (bye), player1 advances automatically
    const winners = currentMatches.map(m => m.winnerId || m.player1);

    // this will check if we have a tournament winner (only 1 player left)
    if (winners.length === 1) {
      tournament.winnerId = winners[0];
      tournament.status = 'completed';
      await tournament.save();

      // this will add the tournament trophy to the winner's profile
      await User.findByIdAndUpdate(winners[0], {
        $push: {
          trophies: {
            title: tournament.trophy.title,
            imageUrl: tournament.trophy.imageUrl,
            wonAt: new Date(),
          }
        }
      });

      return res.json({ message: 'Tournament finished', winnerId: winners[0] });
    }

    // this will randomly shuffle the winners before pairing them for the next round
    const shuffled = [...winners].sort(() => Math.random() - 0.5);
    const nextRoundNum = tournament.currentRound + 1;

    // this will create matches for the next round
    const matches = [];
    for (let i = 0; i + 1 < shuffled.length; i += 2) {
      const match = await Match.create({
        player1: shuffled[i],
        player2: shuffled[i + 1],
        category: tournament.category,
        status: 'waiting',
        tournamentId: tournament._id,
        round: nextRoundNum,
      });
      matches.push(match._id);
    }

    // this will update the round counter and save
    tournament.currentRound = nextRoundNum;
    await tournament.save();

    res.json({ message: `Round ${nextRoundNum} started`, matchesCreated: matches.length, matches });
  } catch (err) {
    next(err);
  }
};
