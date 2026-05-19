import mongoose from 'mongoose';

// this defines what a match looks like in the database
const matchSchema = new mongoose.Schema({
  // this will store the player ids, ref: 'User' lets us use populate() to get full user data
  player1: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  player2: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // this will store the game format, 3 options each gives 18 possible combinations
  category: {
    rounds: { type: Number, enum: [3, 5, 7] },                    // best of 3, 5 or 7
    rules: { type: String, enum: ['straights', 'no-straights'] },  // game rule variant
    timeControl: { type: Number, enum: [5, 10, 15] },              // seconds per round
  },

  // this will track how many rounds each player has won
  score: {
    player1: { type: Number, default: 0 },
    player2: { type: Number, default: 0 },
  },

  // this will be set when the match is finished
  winnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // this will track where the match is in its lifecycle
  status: {
    type: String,
    enum: ['waiting', 'in-progress', 'completed'],
    default: 'waiting',
  },

  // this will hide the match from leaderboards and platform activity if true
  isAnonymous: { type: Boolean, default: false },

  // these will be set if this match belongs to a tournament
  tournamentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', default: null },
  round: { type: Number, default: null }, // which round of the tournament this match is in

}, { timestamps: true });

export default mongoose.model('Match', matchSchema);
