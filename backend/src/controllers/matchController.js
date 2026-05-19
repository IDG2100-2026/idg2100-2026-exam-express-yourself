const Match = require('../models/Match');
const User = require('../models/User');

// this is the standard elo formula used in chess and many competitive games
// k=32 means ratings will change more per game, which is common for newer players
// expected is the predicted chance of winning based on the rating difference between players
function calcElo(winnerRating, loserRating) {
  const expected = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
  const newWinner = Math.round(winnerRating + 32 * (1 - expected)); // this will increase the winners rating
  const newLoser  = Math.round(loserRating  + 32 * (0 - (1 - expected))); // this will decrease the losers rating
  return { newWinner, newLoser };
}

// GET /api/matches?page=1&limit=10
const getAllMatches = async (req, res, next) => {
  try {
    // this will read pagination values from the query, defaulting to page 1 with 10 results
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit; // this will calculate how many to skip for this page

    // this will build a filter, always hide anonymous matches
    const filter = { isAnonymous: false };
    if (req.query.status) filter.status = req.query.status;

    // this will filter by player if a playerId is given in the query
    if (req.query.playerId) {
      filter.$or = [{ player1: req.query.playerId }, { player2: req.query.playerId }];
    }

    // this will fetch only non anonymous matches so they show up in platform activity
    const matches = await Match.find(filter)
      .populate('player1 player2 winnerId', 'username eloRating profileImageUrl') // this will swap ids for actual user data
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({ page, limit, results: matches });
  } catch (err) {
    next(err);
  }
};

// GET /api/matches/:id
const getMatch = async (req, res, next) => {
  try {
    // this will find one match by id and populate the player info
    const match = await Match.findById(req.params.id)
      .populate('player1 player2 winnerId', 'username eloRating profileImageUrl');
    if (!match) return res.status(404).json({ error: 'Match not found' });
    res.json(match);
  } catch (err) {
    next(err);
  }
};

// POST /api/matches
const createMatch = async (req, res, next) => {
  try {
    // this will grab the game format from the request body
    const { rounds, rules, timeControl } = req.body;

    // this will create a new match with player1 set to whoever is making the request
    const match = await Match.create({
      player1: req.userId,
      category: { rounds, rules, timeControl },
      status: 'waiting',
      isAnonymous: req.userType === 'anonymous', // this will mark the match as anonymous if no login
    });
    res.status(201).json(match);
  } catch (err) {
    next(err);
  }
};

// POST /api/matches/:id/join
const joinMatch = async (req, res, next) => {
  try {
    // this will find the match by id
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ error: 'Match not found' });

    // this will block joining if the match is no longer waiting for a player
    if (match.status !== 'waiting') {
      return res.status(400).json({ error: 'Match is not open to join' });
    }

    // this will stop the same player from joining their own match
    if (match.player1.toString() === req.userId) {
      return res.status(400).json({ error: 'You cannot join your own match' });
    }

    // this will set player2 and move the match to in-progress
    match.player2 = req.userId;
    match.status = 'in-progress';
    await match.save();

    res.json({ message: 'Joined match', match });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/matches/:id/result
const recordResult = async (req, res, next) => {
  try {
    const { winnerId, score } = req.body;

    // this will save the result and mark the match as completed
    const match = await Match.findByIdAndUpdate(
      req.params.id,
      { winnerId, score, status: 'completed' },
      { new: true }
    );
    if (!match) return res.status(404).json({ error: 'Match not found' });

    // this will update elo ratings, but only for registered player matches
    if (!match.isAnonymous && match.player1 && match.player2) {
      // this will figure out who lost by checking which player is not the winner
      const loserId = match.player1.toString() === winnerId ? match.player2 : match.player1;

      const winner = await User.findById(winnerId);
      const loser  = await User.findById(loserId);

      if (winner && loser) {
        // this will calculate the new ratings using the elo formula
        const { newWinner, newLoser } = calcElo(winner.eloRating, loser.eloRating);

        // this will update both players in the database
        await User.findByIdAndUpdate(winnerId, { eloRating: newWinner });
        await User.findByIdAndUpdate(loserId,  { eloRating: newLoser });
      }
    }

    res.json(match);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllMatches, getMatch, createMatch, joinMatch, recordResult };
