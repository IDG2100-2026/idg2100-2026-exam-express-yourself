import User from '../models/User.js';
import Match from '../models/Match.js';

// GET /api/leaderboard
// optional filters: ?rounds=5&rules=straights&timeControl=10
// optional sort: ?sortBy=wins | winPercentage | matches, default is eloRating
export const getLeaderboard = async (req, res, next) => {
  try {
    const { rounds, rules, timeControl, sortBy } = req.query;

    // this will return top 20 by elo if no filters are given
    if (!rounds && !rules && !timeControl && !sortBy) {
      const users = await User.find({ isBanned: false })
        .select('username eloRating')
        .sort({ eloRating: -1 }) // this will sort from highest to lowest
        .limit(20);
      return res.json(users);
    }

    // this will build a filter object based on what was passed in the query
    const matchFilter = { status: 'completed', isAnonymous: false };
    if (rounds)      matchFilter['category.rounds']      = parseInt(rounds);
    if (rules)       matchFilter['category.rules']       = rules;
    if (timeControl) matchFilter['category.timeControl'] = parseInt(timeControl);

    // this will fetch all completed matches that match the filter
    const matches = await Match.find(matchFilter).select('player1 player2 winnerId');

    // this will count wins and total matches per user from those matches
    const stats = {};
    for (const match of matches) {
      const p1 = match.player1.toString();
      const p2 = match.player2?.toString();
      const winner = match.winnerId?.toString();

      // this will create a stats entry for each player if it doesnt exist yet
      if (!stats[p1]) stats[p1] = { wins: 0, matches: 0 };
      if (p2 && !stats[p2]) stats[p2] = { wins: 0, matches: 0 };

      stats[p1].matches++;
      if (p2) stats[p2].matches++;
      if (winner) stats[winner].wins++; // this will add a win to whoever won the match
    }

    // this will fetch user info for everyone who appeared in those matches
    const userIds = Object.keys(stats);
    const users = await User.find({ _id: { $in: userIds }, isBanned: false })
      .select('username eloRating');

    // this will combine the user info with their calculated stats
    const ranked = users.map(u => {
      const s = stats[u._id.toString()] || { wins: 0, matches: 0 };
      return {
        username: u.username,
        eloRating: u.eloRating,
        wins: s.wins,
        matches: s.matches,
        winPercentage: s.matches > 0 ? Math.round((s.wins / s.matches) * 100) : 0, // this will avoid dividing by zero
      };
    });

    // this will sort by whatever field was requested
    if (sortBy === 'wins')               ranked.sort((a, b) => b.wins - a.wins);
    else if (sortBy === 'winPercentage') ranked.sort((a, b) => b.winPercentage - a.winPercentage);
    else if (sortBy === 'matches')       ranked.sort((a, b) => b.matches - a.matches);
    else                                 ranked.sort((a, b) => b.eloRating - a.eloRating);

    // this will return only the top 20
    res.json(ranked.slice(0, 20));
  } catch (err) {
    next(err);
  }
};

// GET /api/leaderboard/activity
export const getActivity = async (req, res, next) => {
  try {
    // this will count how many matches are being played right now
    const ongoingMatches = await Match.countDocuments({ status: 'in-progress' });

    // this will get the 10 most recently finished matches for the activity feed
    const recentMatches = await Match.find({ status: 'completed', isAnonymous: false })
      .populate('player1 player2 winnerId', 'username')
      .sort({ updatedAt: -1 }) // this will sort newest first
      .limit(10);

    res.json({ ongoingMatches, recentMatches });
  } catch (err) {
    next(err);
  }
};
