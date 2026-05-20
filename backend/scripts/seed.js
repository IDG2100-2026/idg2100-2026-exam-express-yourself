import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../src/config/db.js';
import User from '../src/models/User.js';
import Match from '../src/models/Match.js';
import Tournament from '../src/models/Tournament.js';
import { Comment } from '../src/models/Comment.js';

const seed = async () => {
  // this will connect to the database before doing anything
  await connectDB();
  console.log('Connected to MongoDB');

  // this will delete everything in all collections so we start fresh every time
  await User.deleteMany({});
  await Match.deleteMany({});
  await Tournament.deleteMany({});
  await Comment.deleteMany({});
  console.log('Cleared existing data');

  // this will hash the shared dummy password once and reuse it for all seed users
  // we never store plain text passwords, even in seed data
  const hashedPassword = await bcrypt.hash('password123', 10);

  // this will create 4 users, one admin and three regular users with different elo ratings
  const users = await User.insertMany([
    { username: 'admin',    email: 'admin@test.com',    password: hashedPassword, age: 29, role: 'admin',  eloRating: 1200 },
    { username: 'nicolai',  email: 'nicolai@test.com',  password: hashedPassword, age: 22, eloRating: 1100 },
    { username: 'aliaksei', email: 'aliaksei@test.com', password: hashedPassword, age: 29, eloRating: 1050 },
    { username: 'carlos',   email: 'carlos@test.com',   password: hashedPassword, age: 32, eloRating: 950  },
  ]);
  console.log('Created users');

  // this will destructure the users array so we can use them by name below
  const [admin, nicolai, aliaksei, carlos] = users;

  // this will create two completed matches with scores and winners already set
  const match1 = await Match.create({
    player1: nicolai._id,
    player2: aliaksei._id,
    category: { rounds: 5, rules: 'straights', timeControl: 10 },
    score: { player1: 3, player2: 2 }, // nicolai won 3 rounds, aliaksei won 2
    winnerId: nicolai._id,
    status: 'completed',
  });

  const match2 = await Match.create({
    player1: aliaksei._id,
    player2: carlos._id,
    category: { rounds: 3, rules: 'no-straights', timeControl: 5 },
    score: { player1: 2, player2: 1 }, // aliaksei won 2 rounds, carlos won 1
    winnerId: aliaksei._id,
    status: 'completed',
  });
  console.log('Created matches');

  // this will create one upcoming tournament created by the admin
  const tournament = await Tournament.create({
    title: 'Spring Championship 2026',
    description: 'First tournament of the year',
    createdBy: admin._id,
    startDate: new Date('2026-04-01'),
    category: { rounds: 5, rules: 'straights', timeControl: 10 },
    participants: [nicolai._id, aliaksei._id, carlos._id], // these three users have joined
    status: 'upcoming',
    trophy: { title: 'Spring Trophy' },
  });
  console.log('Created tournament');

  // this will create some comments on the matches and the tournament
  await Comment.insertMany([
    { authorId: nicolai._id,  text: 'Great match!',                 targetType: 'Match',      targetId: match1._id },
    { authorId: aliaksei._id, text: 'Good game everyone',           targetType: 'Match',      targetId: match1._id },
    { authorId: carlos._id,   text: 'Excited for this tournament!', targetType: 'Tournament', targetId: tournament._id },
  ]);
  console.log('Created comments');

  console.log('Seed complete!');

  // this will close the database connection and exit the script
  await disconnectDB();
  process.exit(0);
};

// this will run the seed function and catch any errors
seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
