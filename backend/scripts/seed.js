import mongoose from "mongoose";
import crypto from "node:crypto";
import User from "../src/models/User.js";
import Match from "../src/models/Match.js";
import Tournament from "../src/models/Tournament.js";
import Comment from "../src/models/Comment.js";

const { DB_HOSTNAME, DB_PORT, DB_NAME } = process.env;
const MONGODB_URI = `mongodb://${DB_HOSTNAME}:${DB_PORT}/${DB_NAME}`;

await mongoose.connect(MONGODB_URI);
console.log("Connected to MongoDB:", MONGODB_URI);

// Clear all collections
await User.deleteMany({});
await Match.deleteMany({});
await Tournament.deleteMany({});
await Comment.deleteMany({});
console.log("Cleared all collections");

// Shared hashed password — all seed users use "password123"
const hashPassword = (password) => {
  const hash = password + process.env.PASSWORD_SALT;
  return crypto.createHash("sha256").update(hash).digest("hex").toString();
};
const hashedPassword = hashPassword("password123");
const verified = { isVerified: true };

// ─── Users ────────────────────────────────────────────────────────────
await User.collection.insertMany([
  { username: "admin", email: "admin@test.com", password: hashedPassword, ...verified, age: 29, role: "admin", eloRating: 1200, points: 500 },
  { username: "emil", email: "emil@test.com", password: hashedPassword, ...verified, age: 20, eloRating: 2867, points: 300 },
  { username: "nicolai", email: "nicolai@test.com", password: hashedPassword, ...verified, age: 22, eloRating: 1100, points: 200 },
  { username: "adrian", email: "adrian@test.com", password: hashedPassword, ...verified, age: 23, eloRating: 1450, points: 150 },
  { username: "sara", email: "sara@test.com", password: hashedPassword, ...verified, age: 22, eloRating: 3700, points: 400 },
  { username: "tobias", email: "tobias@test.com", password: hashedPassword, ...verified, age: 23, eloRating: 860, points: 50 },
  { username: "lena", email: "lena@test.com", password: hashedPassword, ...verified, age: 27, eloRating: 1490, points: 200 },
  { username: "jonas", email: "jonas@test.com", password: hashedPassword, ...verified, age: 24, eloRating: 1498, points: 180 },
  { username: "mira", email: "mira@test.com", password: hashedPassword, ...verified, age: 30, eloRating: 2999, points: 350 },
  { username: "hanna", email: "hanna@test.com", password: hashedPassword, ...verified, age: 21, eloRating: 1400, points: 100 },
  { username: "max", email: "max@test.com", password: hashedPassword, ...verified, age: 25, eloRating: 3000, points: 500 },
  { username: "kristian", email: "kristian@test.com", password: hashedPassword, ...verified, age: 26, eloRating: 1300, points: 100 },
  { username: "ingrid", email: "ingrid@test.com", password: hashedPassword, ...verified, age: 29, eloRating: 2465, points: 250 },
  { username: "fredrik", email: "fredrik@test.com", password: hashedPassword, ...verified, age: 31, eloRating: 1100, points: 100 },
  { username: "camilla", email: "camilla@test.com", password: hashedPassword, ...verified, age: 19, eloRating: 1244, points: 100 },
  { username: "petter", email: "petter@test.com", password: hashedPassword, ...verified, age: 34, eloRating: 1460, points: 150 },
  { username: "silje", email: "silje@test.com", password: hashedPassword, ...verified, age: 22, eloRating: 1085, points: 80 },
  { username: "anders", email: "anders@test.com", password: hashedPassword, ...verified, age: 27, eloRating: 1290, points: 100 },
  { username: "stian", email: "stian@test.com", password: hashedPassword, ...verified, age: 20, eloRating: 3800, points: 500 },
  { username: "thea", email: "thea@test.com", password: hashedPassword, ...verified, age: 23, eloRating: 2000, points: 200 },
]);
const users = await User.find({});
console.log(`Created ${users.length} users`);

// Helper to find user by username
const u = (name) => users.find((u) => u.username === name);

// ─── Completed matches ────────────────────────────────────────────────
const completedMatches = await Match.insertMany([
  {
    players: [{ userId: u("thea")._id }, { userId: u("silje")._id }],
    maxPlayers: 2,
    category: { rounds: 5, straightsAllowed: true, timeControl: 10 },
    status: "completed",
    winnerId: u("thea")._id,
    startedAt: new Date("2026-04-22T12:00:00Z"),
    endedAt: new Date("2026-04-22T12:30:00Z"),
  },
  {
    players: [{ userId: u("max")._id }, { userId: u("stian")._id }],
    maxPlayers: 2,
    category: { rounds: 7, straightsAllowed: true, timeControl: 10 },
    status: "completed",
    winnerId: u("max")._id,
    startedAt: new Date("2026-04-22T15:27:00Z"),
    endedAt: new Date("2026-04-22T15:34:00Z"),
  },
  {
    players: [{ userId: u("emil")._id }, { userId: u("sara")._id }],
    maxPlayers: 2,
    category: { rounds: 3, straightsAllowed: false, timeControl: 30 },
    status: "completed",
    winnerId: u("sara")._id,
    startedAt: new Date("2026-04-20T10:00:00Z"),
    endedAt: new Date("2026-04-20T10:15:00Z"),
  },
  {
    players: [{ userId: u("nicolai")._id }, { userId: u("adrian")._id }],
    maxPlayers: 2,
    category: { rounds: 5, straightsAllowed: true, timeControl: 30 },
    status: "completed",
    winnerId: u("nicolai")._id,
    startedAt: new Date("2026-05-10T14:00:00Z"),
    endedAt: new Date("2026-05-10T14:20:00Z"),
  },
]);
console.log(`Created ${completedMatches.length} completed matches`);

// ─── Ongoing matches ──────────────────────────────────────────────────
const ongoingMatches = await Match.insertMany([
  {
    players: [{ userId: u("ingrid")._id }, { userId: u("fredrik")._id }],
    maxPlayers: 2,
    category: { rounds: 7, straightsAllowed: true, timeControl: 30 },
    status: "in-progress",
    startedAt: new Date("2026-05-20T14:00:00Z"),
  },
  {
    players: [{ userId: u("emil")._id }, { userId: u("mira")._id }],
    maxPlayers: 2,
    category: { rounds: 3, straightsAllowed: true, timeControl: 10 },
    status: "in-progress",
    startedAt: new Date("2026-05-20T15:00:00Z"),
  },
  {
    players: [{ userId: u("anders")._id }, { userId: u("camilla")._id }],
    maxPlayers: 2,
    category: { rounds: 7, straightsAllowed: true, timeControl: 10 },
    status: "in-progress",
    startedAt: new Date("2026-05-20T14:30:00Z"),
  },
  {
    players: [{ userId: u("petter")._id }, { userId: u("lena")._id }],
    maxPlayers: 2,
    category: { rounds: 5, straightsAllowed: true, timeControl: 90 },
    status: "in-progress",
    startedAt: new Date("2026-05-20T14:20:00Z"),
  },
]);
console.log(`Created ${ongoingMatches.length} ongoing matches`);

// ─── Waiting matches (lobby) ──────────────────────────────────────────
const waitingMatches = await Match.insertMany([
  {
    players: [{ userId: u("jonas")._id }],
    maxPlayers: 2,
    category: { rounds: 5, straightsAllowed: true, timeControl: 30 },
    buyIn: 10,
    status: "waiting",
  },
  {
    players: [{ userId: u("hanna")._id }],
    maxPlayers: 2,
    category: { rounds: 3, straightsAllowed: true, timeControl: 10 },
    buyIn: 1,
    status: "waiting",
  },
  {
    players: [{ userId: u("kristian")._id }],
    maxPlayers: 2,
    category: { rounds: 7, straightsAllowed: false, timeControl: 90 },
    buyIn: 50,
    status: "waiting",
  },
  {
    players: [{ userId: u("tobias")._id }],
    maxPlayers: 2,
    category: { rounds: 3, straightsAllowed: true, timeControl: 10 },
    buyIn: 1,
    status: "waiting",
  },
  {
    players: [{ userId: u("adrian")._id }],
    maxPlayers: 3,
    category: { rounds: 5, straightsAllowed: true, timeControl: 30 },
    buyIn: 10,
    status: "waiting",
  },
]);
console.log(`Created ${waitingMatches.length} waiting matches`);

// ─── Tournaments ──────────────────────────────────────────────────────
const tournament1 = await Tournament.create({
  title: "Spring Championship 2026",
  description: "The first major tournament of the year. Battle it out for the Spring Trophy!",
  rules: "Standard round-robin format. All players get randomly paired each round. Top scorer wins.",
  createdBy: u("admin")._id,
  startDate: new Date("2026-06-01T18:00:00Z"),
  numberOfRounds: 3,
  category: { rounds: 5, straightsAllowed: true, timeControl: 30 },
  buyIn: 10,
  participants: [
    u("emil")._id, u("sara")._id, u("nicolai")._id, u("adrian")._id,
    u("mira")._id, u("max")._id, u("stian")._id, u("thea")._id,
  ],
  status: "upcoming",
  trophy: { title: "Spring Champion Trophy" },
});

const tournament2 = await Tournament.create({
  title: "Summer Blitz Cup",
  description: "Fast-paced blitz tournament. Quick rounds, quick thinking!",
  rules: "10-second total time control. No straights allowed. Single elimination.",
  createdBy: u("admin")._id,
  startDate: new Date("2026-07-15T20:00:00Z"),
  numberOfRounds: 4,
  category: { rounds: 3, straightsAllowed: false, timeControl: 10 },
  buyIn: 50,
  participants: [u("sara")._id, u("stian")._id, u("max")._id],
  status: "upcoming",
  trophy: { title: "Blitz Master Trophy" },
});

const tournament3 = await Tournament.create({
  title: "Beginner Friendly Cup",
  description: "Open tournament for players under 1500 ELO. Great practice!",
  createdBy: u("admin")._id,
  startDate: new Date("2026-06-20T16:00:00Z"),
  numberOfRounds: 2,
  category: { rounds: 3, straightsAllowed: true, timeControl: 90 },
  eloRange: { min: 0, max: 1500 },
  participants: [
    u("nicolai")._id, u("adrian")._id, u("tobias")._id, u("hanna")._id,
    u("kristian")._id, u("fredrik")._id, u("camilla")._id, u("silje")._id,
  ],
  status: "upcoming",
  trophy: { title: "Rising Star Trophy" },
});

const tournament4 = await Tournament.create({
  title: "Autumn Classic 2025",
  description: "Last year's autumn tournament.",
  createdBy: u("admin")._id,
  startDate: new Date("2025-10-01T18:00:00Z"),
  category: { rounds: 5, straightsAllowed: true, timeControl: 30 },
  participants: [u("emil")._id, u("sara")._id, u("max")._id, u("mira")._id],
  status: "completed",
  winnerId: u("sara")._id,
  trophy: { title: "Autumn Champion Trophy" },
});

const tournament5 = await Tournament.create({
  title: "Winter Showdown 2026",
  description: "The coldest tournament of the year. Only the strongest survive.",
  createdBy: u("admin")._id,
  startDate: new Date("2026-08-01T18:00:00Z"),
  category: { rounds: 7, straightsAllowed: true, timeControl: 30 },
  participants: [],
  status: "upcoming",
  trophy: { title: "Ice Crown Trophy" },
});

console.log("Created 5 tournaments");

// ─── Comments ─────────────────────────────────────────────────────────
await Comment.insertMany([
  { authorId: u("nicolai")._id, text: "Great match! Really intense finish.", targetType: "Match", targetId: completedMatches[0]._id },
  { authorId: u("adrian")._id, text: "That was so close, well played both!", targetType: "Match", targetId: completedMatches[0]._id },
  { authorId: u("emil")._id, text: "Sara is just too good at this game.", targetType: "Match", targetId: completedMatches[2]._id },
  { authorId: u("sara")._id, text: "GG! Better luck next time 😄", targetType: "Match", targetId: completedMatches[2]._id },
  { authorId: u("hanna")._id, text: "Can't wait for the Spring Championship!", targetType: "Tournament", targetId: tournament1._id },
  { authorId: u("max")._id, text: "I'm coming for that trophy!", targetType: "Tournament", targetId: tournament1._id },
  { authorId: u("tobias")._id, text: "Beginner friendly is perfect for me", targetType: "Tournament", targetId: tournament3._id },
  { authorId: u("kristian")._id, text: "Let's go! Ready to compete!", targetType: "Tournament", targetId: tournament3._id },
  { authorId: u("mira")._id, text: "This was such a fun tournament last year", targetType: "Tournament", targetId: tournament4._id },
]);
console.log("Created comments");

// ─── Award trophy to past tournament winner ──────────────────────────
await User.findByIdAndUpdate(u("sara")._id, {
  $push: {
    trophies: {
      title: "Autumn Champion Trophy",
      wonAt: new Date("2025-10-15"),
    },
  },
});
console.log("Awarded trophy to sara");

console.log("\n✅ Seed complete!");
console.log(`   ${users.length} users (login with any email + 'password123')`);
console.log(`   Admin: admin@test.com / password123`);
console.log(`   ${completedMatches.length + ongoingMatches.length + waitingMatches.length} matches`);
console.log(`   5 tournaments`);

await mongoose.disconnect();
process.exit(0);
