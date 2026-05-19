import mongoose from 'mongoose';

// this defines what a tournament looks like in the database
const tournamentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,

  // this will store who created the tournament, only admins can do this
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  startDate: { type: Date, required: true },

  // this will store the game format, all matches in this tournament use these settings
  category: {
    rounds: { type: Number, enum: [3, 5, 7] },
    rules: { type: String, enum: ['straights', 'no-straights'] },
    timeControl: { type: Number, enum: [5, 10, 15] },
  },

  // this will store all users who have joined the tournament
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // this will track where the tournament is in its lifecycle
  status: {
    type: String,
    enum: ['upcoming', 'in-progress', 'completed'],
    default: 'upcoming',
  },

  // this will store the trophy info, imageUrl points to an uploaded file in /uploads
  trophy: {
    title: String,
    imageUrl: String,
  },

  // this will track which round the tournament is currently on
  currentRound: { type: Number, default: 0 },

  // this will be set when the tournament is finished
  winnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

}, { timestamps: true });

export default mongoose.model('Tournament', tournamentSchema);
