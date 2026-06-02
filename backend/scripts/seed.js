import mongoose from "mongoose";
import crypto from "node:crypto";
import User from "../src/models/User.js";
import Match from "../src/models/Match.js";
import Tournament from "../src/models/Tournament.js";
import Comment from "../src/models/Comment.js";
import { Session } from "../src/models/Session.js";
import { hashPassword } from "../src/utils/password-hash.js";
import SecurityIncident from "../src/models/SecurityIncident.js";

const { DB_HOSTNAME, DB_PORT, DB_NAME } = process.env;
const MONGODB_URI = `mongodb://${DB_HOSTNAME}:${DB_PORT}/${DB_NAME}`;

await mongoose.connect(MONGODB_URI);
console.log("Connected to MongoDB:", MONGODB_URI);

// Clear all collections
await User.deleteMany({});
await Match.deleteMany({});
await Tournament.deleteMany({});
await Comment.deleteMany({});
await Session.deleteMany({});
await SecurityIncident.deleteMany({});
console.log("Cleared all collections");


const verified = { isVerified: true };

// ---- Users ----
await User.insertMany([
{ username: "admin", email: "admin@pokerdados.com", password: hashPassword("Admin123!"), ...verified, age: 23, role: "admin", eloRating: { tc10: 2000, tc30: 1900, tc90: 1800 }, points: 200, isBanned: false },
{ username: "thea", email: "thea@test.com", password: hashPassword("Thea1234!"), ...verified, age: 23, eloRating: { tc10: 2000, tc30: 1900, tc90: 1800 }, points: 200, isBanned: true, bio: "My name is Thea, and i think this platform is awesome" },
{ username: "magnuscr", email: "magnus@test.com", password: hashPassword("Magnus99!"), ...verified, age: 34, eloRating: { tc10: 2850, tc30: 2870, tc90: 2830 }, points: 14200, isBanned: false, bio: "Rolling dice since before I could count. Don't challenge me." },
{ username: "rookierook", email: "rookie@test.com", password: hashPassword("Rookie2026!"), ...verified, age: 18, eloRating: { tc10: 800, tc30: 900, tc90: 850 }, points: 30, isBanned: false, bio: "Just discovered poker dice last month. Still learning the hands!" },
{ username: "queenGambit99", email: "queengambit@test.com", password: hashPassword("Queen1999!"), ...verified, age: 27, eloRating: { tc10: 1650, tc30: 1700, tc90: 1720 }, points: 890, isBanned: false, bio: "Full house is my comfort zone. Anything less and I reroll." },
{ username: "blitzKrieg", email: "blitz@test.com", password: hashPassword("Blitz4ever!"), ...verified, age: 21, eloRating: { tc10: 2100, tc30: 1750, tc90: 1500 }, points: 3100, isBanned: false, bio: "Fast games only. I make my decisions in two seconds flat." },
{ username: "endgameguru", email: "endgame@test.com", password: hashPassword("Endgame45!"), ...verified, age: 45, eloRating: { tc10: 1400, tc30: 1900, tc90: 2150 }, points: 5600, isBanned: false, bio: "Patience and probability. That's all poker dice is about." },
{ username: "patzerPete", email: "pete@test.com", password: hashPassword("Patzer38!"), ...verified, age: 38, eloRating: { tc10: 1050, tc30: 1100, tc90: 1080 }, points: 210, isBanned: false, bio: "I always keep the wrong dice. It's a gift." },
{ username: "siciliandragon", email: "dragon@test.com", password: hashPassword("Dragon29!"), ...verified, age: 29, eloRating: { tc10: 1820, tc30: 1880, tc90: 1860 }, points: 2750, isBanned: false, bio: "Five of a kind or bust. Go big or go home." },
{ username: "diceNinja42", email: "ninja42@test.com", password: hashPassword("Ninja42!!"), ...verified, age: 19, eloRating: { tc10: 1550, tc30: 1480, tc90: 1420 }, points: 670, isBanned: false, bio: "I've memorized every probability table. Still lose to luck." },
{ username: "positionalPam", email: "pam@test.com", password: hashPassword("PamSlow52!"), ...verified, age: 52, eloRating: { tc10: 1300, tc30: 1750, tc90: 1980 }, points: 4300, isBanned: false, bio: "Slow and steady. I think through every reroll like my life depends on it." },
{ username: "toxicbishop", email: "toxicbishop@test.com", password: hashPassword("Toxic025!"), ...verified, age: 25, eloRating: { tc10: 1900, tc30: 1850, tc90: 1780 }, points: 1500, isBanned: true, bio: "Banned for trash talking but my straights still hit different." },
{ username: "cafeplayer", email: "cafe@test.com", password: hashPassword("Cafe1965!"), ...verified, age: 61, eloRating: { tc10: 1200, tc30: 1350, tc90: 1500 }, points: 980, isBanned: false, bio: "Been rolling dice in bars for 40 years. Finally found an online home." },
{ username: "luckyRoller", email: "lucky@test.com", password: hashPassword("LuckyRoll31!"), ...verified, age: 31, eloRating: { tc10: 1680, tc30: 1640, tc90: 1600 }, points: 1120, isBanned: false, bio: "No strategy, just vibes. The dice love me." },
{ username: "scholarsMate", email: "scholar@test.com", password: hashPassword("Scholar14!"), ...verified, age: 18, eloRating: { tc10: 600, tc30: 620, tc90: 580 }, points: 10, isBanned: false, bio: "I keep forgetting which hands beat which. Working on it." },
{ username: "GrandmasterFlash", email: "gmflash@test.com", password: hashPassword("GmFlash28!"), ...verified, age: 28, eloRating: { tc10: 2400, tc30: 2350, tc90: 2280 }, points: 9800, isBanned: false, bio: "Top 100 on the leaderboard. Grinding for number one." },
{ username: "fullHouseFreya", email: "freya@test.com", password: hashPassword("Freya033!"), ...verified, age: 33, eloRating: { tc10: 1450, tc30: 1500, tc90: 1520 }, points: 760, isBanned: false, bio: "I get more full houses than anyone I know. It's my signature hand." },
{ username: "pairStorm", email: "pairstorm@test.com", password: hashPassword("Pairs022!"), ...verified, age: 22, eloRating: { tc10: 1750, tc30: 1700, tc90: 1680 }, points: 1850, isBanned: false, bio: "Two pair is underrated. Fight me." },
{ username: "ZugzwangZoe", email: "zoe@test.com", password: hashPassword("Zoe20260!"), ...verified, age: 26, eloRating: { tc10: 2050, tc30: 2100, tc90: 2080 }, points: 4100, isBanned: false, bio: "I love forcing opponents into bad rerolls. Mind games matter." },
{ username: "fianchettofred", email: "fred@test.com", password: hashPassword("Freddy40!"), ...verified, age: 40, eloRating: { tc10: 1580, tc30: 1620, tc90: 1650 }, points: 1340, isBanned: false, bio: "Three of a kind, hold, pray. Works most of the time, every time." },
{ username: "BongcloudKing", email: "bongcloud@test.com", password: hashPassword("Bongcl20!"), ...verified, age: 20, eloRating: { tc10: 1950, tc30: 1200, tc90: 1100 }, points: 2200, isBanned: false, bio: "I reroll everything every time. Chaos is a strategy." },
{ username: "oddsivan", email: "ivan@test.com", password: hashPassword("IvanOdd36!"), ...verified, age: 36, eloRating: { tc10: 1700, tc30: 1780, tc90: 1820 }, points: 2050, isBanned: false, bio: "I calculate the exact odds before every decision. Yes, it annoys people." },
{ username: "perpetualRoll", email: "perpetual@test.com", password: hashPassword("Perpetu30!"), ...verified, age: 30, eloRating: { tc10: 1380, tc30: 1350, tc90: 1300 }, points: 540, isBanned: false, bio: "If I can't win, I'll make sure it takes forever." },
{ username: "OTBonly", email: "otb@test.com", password: hashPassword("Otb1971!!"), ...verified, age: 55, eloRating: { tc10: 1100, tc30: 1400, tc90: 1700 }, points: 390, isBanned: false, bio: "Real dice on a real table. Online is just practice." },
{ username: "butterfingsmike", email: "mike@test.com", password: hashPassword("Mikey024!"), ...verified, age: 24, eloRating: { tc10: 1600, tc30: 1650, tc90: 1670 }, points: 1010, isBanned: false, bio: "I swear I meant to keep that die." },
{ username: "straightDana", email: "dana@test.com", password: hashPassword("DanaDice32!"), ...verified, age: 32, eloRating: { tc10: 1850, tc30: 1900, tc90: 1870 }, points: 3200, isBanned: false, bio: "I go for the straight every single time. Predictable? Maybe. Effective? Also maybe." },
{ username: "theorynerd", email: "theory@test.com", password: hashPassword("Theory18!"), ...verified, age: 18, eloRating: { tc10: 1920, tc30: 2000, tc90: 2050 }, points: 3700, isBanned: false, bio: "I've read every poker dice strategy guide. Still choke under pressure." },
{ username: "noPairNate", email: "nate@test.com", password: hashPassword("NatePair41!"), ...verified, age: 41, eloRating: { tc10: 1250, tc30: 1280, tc90: 1300 }, points: 440, isBanned: false, bio: "My specialty is rolling five completely unrelated dice. Consistently." },
{ username: "rerollkaren", email: "karen@test.com", password: hashPassword("Karen035!"), ...verified, age: 35, eloRating: { tc10: 1500, tc30: 1600, tc90: 1680 }, points: 1560, isBanned: false, bio: "Conservative rerolls, safe plays, steady climb. Boring but it works." },
{ username: "tempothief", email: "tempo@test.com", password: hashPassword("Tempo017!"), ...verified, age: 19, eloRating: { tc10: 2200, tc30: 2050, tc90: 1900 }, points: 5200, isBanned: false, bio: "Youngest player on the leaderboard and climbing fast." },
{ username: "neverfold", email: "neverfold@test.com", password: hashPassword("Never044!"), ...verified, age: 44, eloRating: { tc10: 1150, tc30: 1200, tc90: 1180 }, points: 280, isBanned: false, bio: "I never give up on a hand. You'll have to beat me." },
{ username: "eldadoloco", email: "dadoloco@test.com", password: hashPassword("DadoLoco23!"), ...verified, age: 23, eloRating: { tc10: 1720, tc30: 1680, tc90: 1650 }, points: 1400, isBanned: false, bio: "Spanish dice runs in my blood. Vamos!" },
{ username: "rollingthunder", email: "thunder@test.com", password: hashPassword("Thunder28!"), ...verified, age: 28, eloRating: { tc10: 1780, tc30: 1820, tc90: 1750 }, points: 2400, isBanned: false, bio: "When the dice hit the table, you better cover your ears." },
{ username: "snakeeyes", email: "snakeeyes@test.com", password: hashPassword("SnakeEye33!"), ...verified, age: 33, eloRating: { tc10: 1350, tc30: 1400, tc90: 1380 }, points: 620, isBanned: false, bio: "I roll ones more than anyone on this platform. It's statistical." },
{ username: "highroller88", email: "highroller@test.com", password: hashPassword("Highroll42!"), ...verified, age: 42, eloRating: { tc10: 2100, tc30: 2050, tc90: 2000 }, points: 7100, isBanned: false, bio: "Big buy-ins only. Low stakes bore me to death." },
{ username: "pokerface", email: "pokerface@test.com", password: hashPassword("Poker026!"), ...verified, age: 26, eloRating: { tc10: 1620, tc30: 1590, tc90: 1550 }, points: 1200, isBanned: false, bio: "You can't read my dice strategy. I barely have one." },
{ username: "doubleSixes", email: "doublesixes@test.com", password: hashPassword("Double19!"), ...verified, age: 19, eloRating: { tc10: 1480, tc30: 1510, tc90: 1530 }, points: 830, isBanned: false, bio: "My friends call me double sixes. It happened once and they never let it go." },
{ username: "ladyluck", email: "ladyluck@test.com", password: hashPassword("LadyLuck30!"), ...verified, age: 30, eloRating: { tc10: 1900, tc30: 1850, tc90: 1820 }, points: 3500, isBanned: false, bio: "Luck is a skill if you believe hard enough." },
{ username: "aceOfDice", email: "aceofdice@test.com", password: hashPassword("AceDice37!"), ...verified, age: 37, eloRating: { tc10: 1550, tc30: 1600, tc90: 1640 }, points: 1050, isBanned: false, bio: "Former poker player. Dice are more honest than cards." },
{ username: "yatzyKing", email: "yatzy@test.com", password: hashPassword("Yatzy048!"), ...verified, age: 48, eloRating: { tc10: 1700, tc30: 1750, tc90: 1800 }, points: 2800, isBanned: false, bio: "Grew up on Yatzy, graduated to poker dice. Same love, higher stakes." },
{ username: "shakeNroll", email: "shakenroll@test.com", password: hashPassword("Shake022!"), ...verified, age: 22, eloRating: { tc10: 1150, tc30: 1200, tc90: 1180 }, points: 150, isBanned: false, bio: "Shake it like you mean it. Every roll counts." },
{ username: "midnightroller", email: "midnight@test.com", password: hashPassword("Midnight29!"), ...verified, age: 29, eloRating: { tc10: 1830, tc30: 1870, tc90: 1890 }, points: 3100, isBanned: false, bio: "I only play after midnight. That's when the real games happen." },
{ username: "boxcars", email: "boxcars@test.com", password: hashPassword("Boxcar35!"), ...verified, age: 35, eloRating: { tc10: 1420, tc30: 1460, tc90: 1440 }, points: 710, isBanned: false, bio: "Named after the best roll in the game. Still waiting to live up to it." },
{ username: "NoMercy", email: "nomercy@test.com", password: hashPassword("Mercy025!"), ...verified, age: 25, eloRating: { tc10: 2250, tc30: 2200, tc90: 2150 }, points: 6400, isBanned: false, bio: "I don't do friendly games. Every match is war." },
]);
const users = await User.find({});
console.log(`Created ${users.length} users`);

// Helper to find user by username
const u = (name) => users.find((u) => u.username === name);

// ---- Completed matches ----
const completedMatches = await Match.insertMany([
  {
    players: [{ userId: u("thea")._id }, { userId: u("fullHouseFreya")._id }],
    maxPlayers: 2,
    category: { rounds: 5, straightsAllowed: true, timeControl: 10 },
    status: "completed",
    winnerId: u("thea")._id,
    startedAt: new Date("2026-04-22T12:00:00Z"),
    endedAt: new Date("2026-04-22T12:30:00Z"),
  },
  {
    players: [{ userId: u("magnuscr")._id }, { userId: u("blitzKrieg")._id }],
    maxPlayers: 2,
    category: { rounds: 7, straightsAllowed: true, timeControl: 10 },
    status: "completed",
    winnerId: u("magnuscr")._id,
    startedAt: new Date("2026-04-22T15:27:00Z"),
    endedAt: new Date("2026-04-22T15:34:00Z"),
  },
  {
    players: [{ userId: u("pairStorm")._id }, { userId: u("ZugzwangZoe")._id }],
    maxPlayers: 2,
    category: { rounds: 3, straightsAllowed: false, timeControl: 30 },
    status: "completed",
    winnerId: u("ZugzwangZoe")._id,
    startedAt: new Date("2026-04-20T10:00:00Z"),
    endedAt: new Date("2026-04-20T10:15:00Z"),
  },
  {
    players: [{ userId: u("oddsivan")._id }, { userId: u("siciliandragon")._id }],
    maxPlayers: 2,
    category: { rounds: 5, straightsAllowed: true, timeControl: 30 },
    status: "completed",
    winnerId: u("oddsivan")._id,
    startedAt: new Date("2026-05-10T14:00:00Z"),
    endedAt: new Date("2026-05-10T14:20:00Z"),
  },
  {
    players: [{ userId: u("ZugzwangZoe")._id }, { userId: u("straightDana")._id }],
    maxPlayers: 2,
    category: { rounds: 5, straightsAllowed: true, timeControl: 10 },
    status: "completed",
    winnerId: u("ZugzwangZoe")._id,
    startedAt: new Date("2026-04-28T11:00:00Z"),
    endedAt: new Date("2026-04-28T11:18:00Z"),
  },
  {
    players: [{ userId: u("magnuscr")._id }, { userId: u("ZugzwangZoe")._id }],
    maxPlayers: 2,
    category: { rounds: 7, straightsAllowed: true, timeControl: 30 },
    status: "completed",
    winnerId: u("magnuscr")._id,
    startedAt: new Date("2026-05-03T19:00:00Z"),
    endedAt: new Date("2026-05-03T19:25:00Z"),
  },
  {
    players: [{ userId: u("ZugzwangZoe")._id }, { userId: u("blitzKrieg")._id }],
    maxPlayers: 2,
    category: { rounds: 3, straightsAllowed: false, timeControl: 90 },
    status: "completed",
    winnerId: u("blitzKrieg")._id,
    startedAt: new Date("2026-05-15T16:30:00Z"),
    endedAt: new Date("2026-05-15T16:50:00Z"),
  },
  {
    players: [{ userId: u("ZugzwangZoe")._id }, { userId: u("rerollkaren")._id }],
    maxPlayers: 2,
    category: { rounds: 5, straightsAllowed: false, timeControl: 10 },
    status: "completed",
    winnerId: u("ZugzwangZoe")._id,
    startedAt: new Date("2026-05-22T13:00:00Z"),
    endedAt: new Date("2026-05-22T13:20:00Z"),
  },
  {
    players: [{ userId: u("ZugzwangZoe")._id }, { userId: u("endgameguru")._id }, { userId: u("positionalPam")._id }],
    maxPlayers: 3,
    category: { rounds: 3, straightsAllowed: true, timeControl: 30 },
    status: "completed",
    winnerId: u("ZugzwangZoe")._id,
    startedAt: new Date("2026-05-25T10:00:00Z"),
    endedAt: new Date("2026-05-25T10:22:00Z"),
  },
  {
    players: [{ userId: u("ZugzwangZoe")._id }, { userId: u("blitzKrieg")._id }, { userId: u("tempothief")._id }, { userId: u("GrandmasterFlash")._id }, { userId: u("theorynerd")._id }],
    maxPlayers: 5,
    category: { rounds: 5, straightsAllowed: false, timeControl: 10 },
    status: "completed",
    winnerId: u("blitzKrieg")._id,
    startedAt: new Date("2026-05-27T18:00:00Z"),
    endedAt: new Date("2026-05-27T18:35:00Z"),
  },
  {
    players: [{ userId: u("GrandmasterFlash")._id }, { userId: u("tempothief")._id }],
    maxPlayers: 2,
    category: { rounds: 7, straightsAllowed: true, timeControl: 10 },
    status: "completed",
    winnerId: u("GrandmasterFlash")._id,
    startedAt: new Date("2026-04-19T09:00:00Z"),
    endedAt: new Date("2026-04-19T09:22:00Z"),
  },
  {
    players: [{ userId: u("rookierook")._id }, { userId: u("scholarsMate")._id }],
    maxPlayers: 2,
    category: { rounds: 3, straightsAllowed: false, timeControl: 30 },
    status: "completed",
    winnerId: u("rookierook")._id,
    startedAt: new Date("2026-04-21T14:00:00Z"),
    endedAt: new Date("2026-04-21T14:12:00Z"),
  },
  {
    players: [{ userId: u("endgameguru")._id }, { userId: u("positionalPam")._id }],
    maxPlayers: 2,
    category: { rounds: 5, straightsAllowed: true, timeControl: 90 },
    status: "completed",
    winnerId: u("positionalPam")._id,
    startedAt: new Date("2026-04-23T20:00:00Z"),
    endedAt: new Date("2026-04-23T20:45:00Z"),
  },
  {
    players: [{ userId: u("BongcloudKing")._id }, { userId: u("luckyRoller")._id }],
    maxPlayers: 2,
    category: { rounds: 3, straightsAllowed: true, timeControl: 10 },
    status: "completed",
    winnerId: u("luckyRoller")._id,
    startedAt: new Date("2026-04-25T17:30:00Z"),
    endedAt: new Date("2026-04-25T17:40:00Z"),
  },
  {
    players: [{ userId: u("cafeplayer")._id }, { userId: u("OTBonly")._id }],
    maxPlayers: 2,
    category: { rounds: 5, straightsAllowed: false, timeControl: 90 },
    status: "completed",
    winnerId: u("OTBonly")._id,
    startedAt: new Date("2026-04-26T11:00:00Z"),
    endedAt: new Date("2026-04-26T11:50:00Z"),
  },
  {
    players: [{ userId: u("toxicbishop")._id }, { userId: u("neverfold")._id }],
    maxPlayers: 2,
    category: { rounds: 7, straightsAllowed: true, timeControl: 10 },
    status: "completed",
    winnerId: u("toxicbishop")._id,
    startedAt: new Date("2026-04-27T22:00:00Z"),
    endedAt: new Date("2026-04-27T22:18:00Z"),
  },
  {
    players: [{ userId: u("diceNinja42")._id }, { userId: u("fianchettofred")._id }],
    maxPlayers: 2,
    category: { rounds: 5, straightsAllowed: true, timeControl: 30 },
    status: "completed",
    winnerId: u("diceNinja42")._id,
    startedAt: new Date("2026-04-29T08:00:00Z"),
    endedAt: new Date("2026-04-29T08:25:00Z"),
  },
  {
    players: [{ userId: u("eldadoloco")._id }, { userId: u("perpetualRoll")._id }],
    maxPlayers: 2,
    category: { rounds: 3, straightsAllowed: false, timeControl: 10 },
    status: "completed",
    winnerId: u("eldadoloco")._id,
    startedAt: new Date("2026-04-30T15:00:00Z"),
    endedAt: new Date("2026-04-30T15:10:00Z"),
  },
  {
    players: [{ userId: u("queenGambit99")._id }, { userId: u("butterfingsmike")._id }],
    maxPlayers: 2,
    category: { rounds: 5, straightsAllowed: true, timeControl: 30 },
    status: "completed",
    winnerId: u("queenGambit99")._id,
    startedAt: new Date("2026-05-01T13:00:00Z"),
    endedAt: new Date("2026-05-01T13:28:00Z"),
  },
  {
    players: [{ userId: u("noPairNate")._id }, { userId: u("patzerPete")._id }],
    maxPlayers: 2,
    category: { rounds: 3, straightsAllowed: false, timeControl: 10 },
    status: "completed",
    winnerId: u("patzerPete")._id,
    startedAt: new Date("2026-05-02T19:00:00Z"),
    endedAt: new Date("2026-05-02T19:08:00Z"),
  },
  {
    players: [{ userId: u("tempothief")._id }, { userId: u("theorynerd")._id }],
    maxPlayers: 2,
    category: { rounds: 7, straightsAllowed: true, timeControl: 10 },
    status: "completed",
    winnerId: u("tempothief")._id,
    startedAt: new Date("2026-05-04T21:00:00Z"),
    endedAt: new Date("2026-05-04T21:15:00Z"),
  },
  {
    players: [{ userId: u("magnuscr")._id }, { userId: u("GrandmasterFlash")._id }],
    maxPlayers: 2,
    category: { rounds: 7, straightsAllowed: true, timeControl: 30 },
    status: "completed",
    winnerId: u("magnuscr")._id,
    startedAt: new Date("2026-05-05T16:00:00Z"),
    endedAt: new Date("2026-05-05T16:30:00Z"),
  },
  {
    players: [{ userId: u("straightDana")._id }, { userId: u("rerollkaren")._id }, { userId: u("fullHouseFreya")._id }],
    maxPlayers: 3,
    category: { rounds: 5, straightsAllowed: true, timeControl: 30 },
    status: "completed",
    winnerId: u("straightDana")._id,
    startedAt: new Date("2026-05-07T10:00:00Z"),
    endedAt: new Date("2026-05-07T10:30:00Z"),
  },
  {
    players: [{ userId: u("siciliandragon")._id }, { userId: u("diceNinja42")._id }],
    maxPlayers: 2,
    category: { rounds: 5, straightsAllowed: false, timeControl: 10 },
    status: "completed",
    winnerId: u("siciliandragon")._id,
    startedAt: new Date("2026-05-08T18:00:00Z"),
    endedAt: new Date("2026-05-08T18:14:00Z"),
  },
  {
    players: [{ userId: u("luckyRoller")._id }, { userId: u("perpetualRoll")._id }, { userId: u("BongcloudKing")._id }],
    maxPlayers: 3,
    category: { rounds: 3, straightsAllowed: true, timeControl: 10 },
    status: "completed",
    winnerId: u("BongcloudKing")._id,
    startedAt: new Date("2026-05-09T20:00:00Z"),
    endedAt: new Date("2026-05-09T20:15:00Z"),
  },
  {
    players: [{ userId: u("thea")._id }, { userId: u("queenGambit99")._id }],
    maxPlayers: 2,
    category: { rounds: 5, straightsAllowed: true, timeControl: 30 },
    status: "completed",
    winnerId: u("thea")._id,
    startedAt: new Date("2026-05-11T12:00:00Z"),
    endedAt: new Date("2026-05-11T12:22:00Z"),
  },
  {
    players: [{ userId: u("GrandmasterFlash")._id }, { userId: u("oddsivan")._id }],
    maxPlayers: 2,
    category: { rounds: 7, straightsAllowed: true, timeControl: 90 },
    status: "completed",
    winnerId: u("GrandmasterFlash")._id,
    startedAt: new Date("2026-05-12T15:00:00Z"),
    endedAt: new Date("2026-05-12T15:55:00Z"),
  },
  {
    players: [{ userId: u("patzerPete")._id }, { userId: u("cafeplayer")._id }, { userId: u("neverfold")._id }, { userId: u("noPairNate")._id }, { userId: u("shakeNroll")._id }],
    maxPlayers: 5,
    category: { rounds: 5, straightsAllowed: false, timeControl: 30 },
    status: "completed",
    winnerId: u("cafeplayer")._id,
    startedAt: new Date("2026-05-14T11:00:00Z"),
    endedAt: new Date("2026-05-14T11:35:00Z"),
  },
  {
    players: [{ userId: u("endgameguru")._id }, { userId: u("fianchettofred")._id }],
    maxPlayers: 2,
    category: { rounds: 5, straightsAllowed: true, timeControl: 90 },
    status: "completed",
    winnerId: u("endgameguru")._id,
    startedAt: new Date("2026-05-16T09:00:00Z"),
    endedAt: new Date("2026-05-16T09:48:00Z"),
  },
  {
    players: [{ userId: u("tempothief")._id }, { userId: u("blitzKrieg")._id }],
    maxPlayers: 2,
    category: { rounds: 7, straightsAllowed: true, timeControl: 10 },
    status: "completed",
    winnerId: u("tempothief")._id,
    startedAt: new Date("2026-05-18T22:00:00Z"),
    endedAt: new Date("2026-05-18T22:12:00Z"),
  },
  {
    players: [{ userId: u("eldadoloco")._id }, { userId: u("butterfingsmike")._id }, { userId: u("rookierook")._id }],
    maxPlayers: 3,
    category: { rounds: 3, straightsAllowed: true, timeControl: 30 },
    status: "completed",
    winnerId: u("eldadoloco")._id,
    startedAt: new Date("2026-05-20T14:00:00Z"),
    endedAt: new Date("2026-05-20T14:18:00Z"),
  },
  {
    players: [{ userId: u("magnuscr")._id }, { userId: u("tempothief")._id }],
    maxPlayers: 2,
    category: { rounds: 7, straightsAllowed: true, timeControl: 30 },
    status: "completed",
    winnerId: u("tempothief")._id,
    startedAt: new Date("2026-05-23T17:00:00Z"),
    endedAt: new Date("2026-05-23T17:28:00Z"),
  },
  {
    players: [{ userId: u("positionalPam")._id }, { userId: u("rerollkaren")._id }],
    maxPlayers: 2,
    category: { rounds: 5, straightsAllowed: false, timeControl: 90 },
    status: "completed",
    winnerId: u("positionalPam")._id,
    startedAt: new Date("2026-05-24T08:00:00Z"),
    endedAt: new Date("2026-05-24T08:42:00Z"),
  },
  {
    players: [{ userId: u("GrandmasterFlash")._id }, { userId: u("magnuscr")._id }, { userId: u("ZugzwangZoe")._id }, { userId: u("tempothief")._id }, { userId: u("highroller88")._id }],
    maxPlayers: 5,
    category: { rounds: 7, straightsAllowed: true, timeControl: 30 },
    status: "completed",
    winnerId: u("magnuscr")._id,
    startedAt: new Date("2026-05-26T19:00:00Z"),
    endedAt: new Date("2026-05-26T19:40:00Z"),
  },
  {
    players: [{ userId: u("toxicbishop")._id }, { userId: u("BongcloudKing")._id }],
    maxPlayers: 2,
    category: { rounds: 3, straightsAllowed: true, timeControl: 10 },
    status: "completed",
    winnerId: u("BongcloudKing")._id,
    startedAt: new Date("2026-05-28T23:00:00Z"),
    endedAt: new Date("2026-05-28T23:09:00Z"),
  },
]);
console.log(`Created ${completedMatches.length} completed matches`);
console.log(`Created ${completedMatches.length} completed matches`);

// ---- Ongoing matches ----
const ongoingMatches = await Match.insertMany([
  {
    players: [{ userId: u("magnuscr")._id }, { userId: u("NoMercy")._id }],
    maxPlayers: 2,
    category: { rounds: 7, straightsAllowed: true, timeControl: 30 },
    status: "in-progress",
    startedAt: new Date("2026-05-30T14:00:00Z"),
  },
  {
    players: [{ userId: u("ZugzwangZoe")._id }, { userId: u("ladyluck")._id }],
    maxPlayers: 2,
    category: { rounds: 3, straightsAllowed: true, timeControl: 10 },
    status: "in-progress",
    startedAt: new Date("2026-05-30T15:00:00Z"),
  },
  {
    players: [{ userId: u("blitzKrieg")._id }, { userId: u("midnightroller")._id }],
    maxPlayers: 2,
    category: { rounds: 7, straightsAllowed: true, timeControl: 10 },
    status: "in-progress",
    startedAt: new Date("2026-05-30T14:30:00Z"),
  },
  {
    players: [{ userId: u("highroller88")._id }, { userId: u("straightDana")._id }],
    maxPlayers: 2,
    category: { rounds: 5, straightsAllowed: true, timeControl: 90 },
    status: "in-progress",
    startedAt: new Date("2026-05-30T14:20:00Z"),
  },
  {
    players: [{ userId: u("theorynerd")._id }, { userId: u("rollingthunder")._id }],
    maxPlayers: 2,
    category: { rounds: 5, straightsAllowed: false, timeControl: 30 },
    status: "in-progress",
    startedAt: new Date("2026-05-30T13:45:00Z"),
  },
  {
    players: [{ userId: u("patzerPete")._id }, { userId: u("snakeeyes")._id }],
    maxPlayers: 2,
    category: { rounds: 3, straightsAllowed: true, timeControl: 10 },
    status: "in-progress",
    startedAt: new Date("2026-05-30T15:10:00Z"),
  },
  {
    players: [{ userId: u("oddsivan")._id }, { userId: u("yatzyKing")._id }],
    maxPlayers: 2,
    category: { rounds: 7, straightsAllowed: true, timeControl: 90 },
    status: "in-progress",
    startedAt: new Date("2026-05-30T12:00:00Z"),
  },
  {
    players: [{ userId: u("luckyRoller")._id }, { userId: u("boxcars")._id }],
    maxPlayers: 2,
    category: { rounds: 5, straightsAllowed: true, timeControl: 10 },
    status: "in-progress",
    startedAt: new Date("2026-05-30T15:20:00Z"),
  },
  {
    players: [{ userId: u("pairStorm")._id }, { userId: u("aceOfDice")._id }],
    maxPlayers: 2,
    category: { rounds: 5, straightsAllowed: false, timeControl: 30 },
    status: "in-progress",
    startedAt: new Date("2026-05-30T14:50:00Z"),
  },
  {
    players: [{ userId: u("cafeplayer")._id }, { userId: u("OTBonly")._id }],
    maxPlayers: 2,
    category: { rounds: 7, straightsAllowed: true, timeControl: 90 },
    status: "in-progress",
    startedAt: new Date("2026-05-30T11:30:00Z"),
  },
  {
    players: [{ userId: u("perpetualRoll")._id }, { userId: u("doubleSixes")._id }],
    maxPlayers: 2,
    category: { rounds: 3, straightsAllowed: true, timeControl: 10 },
    status: "in-progress",
    startedAt: new Date("2026-05-30T15:30:00Z"),
  },
  {
    players: [{ userId: u("pokerface")._id }, { userId: u("fianchettofred")._id }],
    maxPlayers: 2,
    category: { rounds: 5, straightsAllowed: true, timeControl: 30 },
    status: "in-progress",
    startedAt: new Date("2026-05-30T13:00:00Z"),
  },
  {
    players: [{ userId: u("neverfold")._id }, { userId: u("shakeNroll")._id }],
    maxPlayers: 2,
    category: { rounds: 3, straightsAllowed: false, timeControl: 10 },
    status: "in-progress",
    startedAt: new Date("2026-05-30T15:40:00Z"),
  },
  {
    players: [{ userId: u("queenGambit99")._id }, { userId: u("noPairNate")._id }],
    maxPlayers: 2,
    category: { rounds: 7, straightsAllowed: true, timeControl: 30 },
    status: "in-progress",
    startedAt: new Date("2026-05-30T14:10:00Z"),
  },
  {
    players: [{ userId: u("butterfingsmike")._id }, { userId: u("rookierook")._id }],
    maxPlayers: 2,
    category: { rounds: 5, straightsAllowed: true, timeControl: 10 },
    status: "in-progress",
    startedAt: new Date("2026-05-30T15:50:00Z"),
  },
]);
console.log(`Created ${ongoingMatches.length} ongoing matches`);

// ---- Waiting matches ----
const waitingMatches = await Match.insertMany([
  {
    players: [{ userId: u("endgameguru")._id }],
    maxPlayers: 2,
    category: { rounds: 5, straightsAllowed: true, timeControl: 30 },
    buyIn: 10,
    status: "waiting",
  },
  {
    players: [{ userId: u("fullHouseFreya")._id }],
    maxPlayers: 2,
    category: { rounds: 3, straightsAllowed: true, timeControl: 10 },
    buyIn: 1,
    status: "waiting",
  },
  {
    players: [{ userId: u("GrandmasterFlash")._id }],
    maxPlayers: 2,
    category: { rounds: 7, straightsAllowed: false, timeControl: 90 },
    buyIn: 50,
    status: "waiting",
  },
  {
    players: [{ userId: u("diceNinja42")._id }],
    maxPlayers: 2,
    category: { rounds: 3, straightsAllowed: true, timeControl: 10 },
    buyIn: 1,
    status: "waiting",
  },
  {
    players: [{ userId: u("siciliandragon")._id }],
    maxPlayers: 3,
    category: { rounds: 5, straightsAllowed: true, timeControl: 30 },
    buyIn: 10,
    status: "waiting",
  },
  {
    players: [{ userId: u("eldadoloco")._id }],
    maxPlayers: 2,
    category: { rounds: 5, straightsAllowed: false, timeControl: 10 },
    buyIn: 1,
    status: "waiting",
  },
  {
    players: [{ userId: u("rerollkaren")._id }],
    maxPlayers: 3,
    category: { rounds: 7, straightsAllowed: true, timeControl: 30 },
    buyIn: 10,
    status: "waiting",
  },
  {
    players: [{ userId: u("BongcloudKing")._id }],
    maxPlayers: 2,
    category: { rounds: 3, straightsAllowed: true, timeControl: 10 },
    buyIn: 1,
    status: "waiting",
  },
  {
    players: [{ userId: u("tempothief")._id }],
    maxPlayers: 2,
    category: { rounds: 5, straightsAllowed: true, timeControl: 10 },
    buyIn: 50,
    status: "waiting",
  },
  {
    players: [{ userId: u("positionalPam")._id }],
    maxPlayers: 3,
    category: { rounds: 5, straightsAllowed: false, timeControl: 90 },
    buyIn: 10,
    status: "waiting",
  },
]);
console.log(`Created ${waitingMatches.length} waiting matches`);

// ---- Upcoming Tournaments ----
const upcomingTournament1 = await Tournament.create({
  title: "Summer Showdown 2026",
  description: "Kick off the summer with a high-stakes dice battle. Only the sharpest rollers survive.",
  createdBy: u("admin")._id,
  startDate: new Date("2026-06-15T18:00:00Z"),
  numberOfRounds: 3,
  category: { rounds: 5, straightsAllowed: true, timeControl: 30 },
  buyIn: 10,
  participants: [
    u("magnuscr")._id, u("ZugzwangZoe")._id, u("blitzKrieg")._id, u("GrandmasterFlash")._id,
  ],
  status: "upcoming",
  trophy: { title: "Summer Showdown Trophy", imageUrl: "/uploads/trophy.jpg" },
});

const upcomingTournament2 = await Tournament.create({
  title: "Midnight Madness",
  description: "A late-night tournament for the night owls. Starts at midnight, ends when someone claims the crown.",
  createdBy: u("admin")._id,
  startDate: new Date("2026-06-20T22:00:00Z"),
  numberOfRounds: 5,
  category: { rounds: 7, straightsAllowed: true, timeControl: 10 },
  buyIn: 1,
  participants: [
    u("midnightroller")._id, u("tempothief")._id, u("luckyRoller")._id,
    u("BongcloudKing")._id, u("eldadoloco")._id,
  ],
  status: "upcoming",
  trophy: { title: "Midnight Madness Trophy", imageUrl: "/uploads/trophy.jpg" },
});

const upcomingTournament3 = await Tournament.create({
  title: "The Grand Slam",
  description: "The biggest tournament of the season. High buy-in, high reward. Do you have what it takes?",
  createdBy: u("admin")._id,
  startDate: new Date("2026-07-01T16:00:00Z"),
  numberOfRounds: 5,
  category: { rounds: 7, straightsAllowed: true, timeControl: 90 },
  buyIn: 50,
  participants: [],
  status: "upcoming",
  trophy: { title: "Grand Slam Trophy", imageUrl: "/uploads/trophy.jpg" },
});

const upcomingTournament4 = await Tournament.create({
  title: "Rookie Rumble",
  description: "A beginner-friendly tournament. Low stakes, good vibes, and a chance to learn from the best.",
  createdBy: u("admin")._id,
  startDate: new Date("2026-06-10T14:00:00Z"),
  numberOfRounds: 3,
  category: { rounds: 3, straightsAllowed: false, timeControl: 30 },
  buyIn: 1,
  participants: [
    u("rookierook")._id, u("scholarsMate")._id,
  ],
  status: "upcoming",
  trophy: { title: "Rookie Rumble Trophy", imageUrl: "/uploads/trophy.jpg" },
});

const upcomingTournament5 = await Tournament.create({
  title: "No Straights Allowed",
  description: "Think you can win without straights? Prove it. Pure pairs, triples, and full houses only.",
  createdBy: u("admin")._id,
  startDate: new Date("2026-06-25T17:00:00Z"),
  numberOfRounds: 3,
  category: { rounds: 5, straightsAllowed: false, timeControl: 10 },
  buyIn: 10,
  participants: [
    u("straightDana")._id, u("rerollkaren")._id, u("oddsivan")._id,
    u("positionalPam")._id, u("NoMercy")._id, u("highroller88")._id,
  ],
  status: "upcoming",
  trophy: { title: "No Straights Trophy", imageUrl: "/uploads/trophy.jpg" },
});
console.log("Created 5 upcoming tournaments");

// ---- Completed Tournaments ----
const completedTournament1 = await Tournament.create({
  title: "Autumn Classic 2025",
  description: "Last year's autumn tournament. A legendary bracket that went down to the final roll.",
  createdBy: u("admin")._id,
  startDate: new Date("2025-10-01T18:00:00Z"),
  category: { rounds: 5, straightsAllowed: true, timeControl: 30 },
  participants: [u("magnuscr")._id, u("ZugzwangZoe")._id, u("GrandmasterFlash")._id, u("tempothief")._id],
  status: "completed",
  winnerId: u("magnuscr")._id,
  trophy: { title: "Autumn Champion Trophy", imageUrl: "/uploads/trophy.jpg" },
});

const completedTournament2 = await Tournament.create({
  title: "Winter Freeze 2025",
  description: "The coldest tournament of the year. No straights, no mercy, no excuses.",
  createdBy: u("admin")._id,
  startDate: new Date("2025-12-15T17:00:00Z"),
  category: { rounds: 7, straightsAllowed: false, timeControl: 90 },
  participants: [u("endgameguru")._id, u("positionalPam")._id, u("oddsivan")._id, u("rerollkaren")._id, u("highroller88")._id, u("NoMercy")._id],
  status: "completed",
  winnerId: u("NoMercy")._id,
  trophy: { title: "Winter Freeze Trophy", imageUrl: "/uploads/trophy.jpg" },
});

const completedTournament3 = await Tournament.create({
  title: "New Year Blitz 2026",
  description: "Ring in the new year with fast dice and faster decisions. First tournament of 2026.",
  createdBy: u("admin")._id,
  startDate: new Date("2026-01-02T20:00:00Z"),
  category: { rounds: 3, straightsAllowed: true, timeControl: 10 },
  participants: [u("blitzKrieg")._id, u("tempothief")._id, u("diceNinja42")._id, u("BongcloudKing")._id, u("luckyRoller")._id],
  status: "completed",
  winnerId: u("blitzKrieg")._id,
  trophy: { title: "New Year Blitz Trophy", imageUrl: "/uploads/trophy.jpg" },
});

const completedTournament4 = await Tournament.create({
  title: "Valentine's Dice Duel",
  description: "Love is temporary. A five of a kind is forever. Show your passion at the table.",
  createdBy: u("admin")._id,
  startDate: new Date("2026-02-14T19:00:00Z"),
  category: { rounds: 5, straightsAllowed: true, timeControl: 30 },
  participants: [u("straightDana")._id, u("fullHouseFreya")._id, u("ladyluck")._id, u("midnightroller")._id, u("rollingthunder")._id, u("siciliandragon")._id, u("pairStorm")._id, u("thea")._id],
  status: "completed",
  winnerId: u("ladyluck")._id,
  trophy: { title: "Valentine's Dice Trophy", imageUrl: "/uploads/trophy.jpg" },
});

const completedTournament5 = await Tournament.create({
  title: "March Madness Dice",
  description: "Chaos reigns in March. Upsets, comebacks, and wild rolls. Anything can happen.",
  createdBy: u("admin")._id,
  startDate: new Date("2026-03-20T16:00:00Z"),
  category: { rounds: 5, straightsAllowed: false, timeControl: 10 },
  participants: [u("patzerPete")._id, u("cafeplayer")._id, u("neverfold")._id, u("snakeeyes")._id, u("boxcars")._id, u("shakeNroll")._id],
  status: "completed",
  winnerId: u("cafeplayer")._id,
  trophy: { title: "March Madness Trophy", imageUrl: "/uploads/trophy.jpg" },
});
console.log("Created 5 completed tournaments");


// ---- Cancelled Tournaments ----
const cancelledTournament1 = await Tournament.create({
  title: "El Clásico Dice",
  description: "A Spanish dice tradition. Was supposed to be the biggest event of the spring.",
  createdBy: u("admin")._id,
  startDate: new Date("2026-04-10T18:00:00Z"),
  category: { rounds: 5, straightsAllowed: true, timeControl: 30 },
  participants: [u("eldadoloco")._id, u("siciliandragon")._id, u("rollingthunder")._id],
  status: "cancelled",
  trophy: { title: "El Clásico Trophy", imageUrl: "/uploads/trophy.jpg" },
});

const cancelledTournament2 = await Tournament.create({
  title: "50 Buy-In Bonanza",
  description: "The highest stakes tournament we ever planned. Not enough brave souls signed up.",
  createdBy: u("admin")._id,
  startDate: new Date("2026-03-05T20:00:00Z"),
  category: { rounds: 7, straightsAllowed: true, timeControl: 90 },
  participants: [u("highroller88")._id],
  status: "cancelled",
  trophy: { title: "Bonanza Trophy", imageUrl: "/uploads/trophy.jpg" },
});

const cancelledTournament3 = await Tournament.create({
  title: "Friday Night Frenzy",
  description: "Fast paced Friday night action. Cancelled due to server maintenance. We'll be back.",
  createdBy: u("admin")._id,
  startDate: new Date("2026-05-08T21:00:00Z"),
  category: { rounds: 3, straightsAllowed: true, timeControl: 10 },
  participants: [u("blitzKrieg")._id, u("tempothief")._id, u("diceNinja42")._id, u("perpetualRoll")._id, u("BongcloudKing")._id],
  status: "cancelled",
  trophy: { title: "Friday Frenzy Trophy", imageUrl: "/uploads/trophy.jpg" },
});

const cancelledTournament4 = await Tournament.create({
  title: "Ghost Tournament",
  description: "We announced it. Nobody showed up. Fair enough.",
  createdBy: u("admin")._id,
  startDate: new Date("2026-02-28T15:00:00Z"),
  category: { rounds: 5, straightsAllowed: false, timeControl: 30 },
  participants: [],
  status: "cancelled",
  trophy: { title: "Ghost Trophy", imageUrl: "/uploads/trophy.jpg" },
});

const cancelledTournament5 = await Tournament.create({
  title: "April Fools Dice Off",
  description: "Was it a real tournament or a prank? We'll never tell. Either way, it didn't happen.",
  createdBy: u("admin")._id,
  startDate: new Date("2026-04-01T12:00:00Z"),
  category: { rounds: 3, straightsAllowed: true, timeControl: 10 },
  participants: [u("luckyRoller")._id, u("pokerface")._id],
  status: "cancelled",
  trophy: { title: "April Fools Trophy", imageUrl: "/uploads/trophy.jpg" },
});
console.log("Created 5 cancelled tournaments");


// ---- Comments ----
await Comment.insertMany([
  // Comments on completed matches
  { authorId: u("fullHouseFreya")._id, text: "Great match! Really intense finish.", targetType: "Match", targetId: completedMatches[0]._id },
  { authorId: u("magnuscr")._id, text: "That was over before it started, sorry blitz!", targetType: "Match", targetId: completedMatches[1]._id },
  { authorId: u("blitzKrieg")._id, text: "I'll get you next time magnuscr. Count on it.", targetType: "Match", targetId: completedMatches[1]._id },
  { authorId: u("pairStorm")._id, text: "Zoe is just too good at mind games.", targetType: "Match", targetId: completedMatches[2]._id },
  { authorId: u("ZugzwangZoe")._id, text: "GG! You had me sweating on that last round though.", targetType: "Match", targetId: completedMatches[2]._id },
  { authorId: u("tempothief")._id, text: "Can't believe I took down magnuscr. Best day on this platform.", targetType: "Match", targetId: completedMatches[31]._id },
  { authorId: u("GrandmasterFlash")._id, text: "That 5 player match was absolute chaos. Loved every second.", targetType: "Match", targetId: completedMatches[9]._id },
  { authorId: u("cafeplayer")._id, text: "Old man still got it. Four player lobby and I walked away with the W.", targetType: "Match", targetId: completedMatches[27]._id },
  { authorId: u("noPairNate")._id, text: "I rolled five completely different dice three rounds in a row. Classic me.", targetType: "Match", targetId: completedMatches[19]._id },
  { authorId: u("rookierook")._id, text: "My first ever win on the platform! Let's go!", targetType: "Match", targetId: completedMatches[11]._id },
  { authorId: u("BongcloudKing")._id, text: "Chaos strategy actually worked for once lmao", targetType: "Match", targetId: completedMatches[24]._id },

  // Comments on upcoming tournaments
  { authorId: u("magnuscr")._id, text: "I'm coming for that trophy!", targetType: "Tournament", targetId: upcomingTournament1._id },
  { authorId: u("GrandmasterFlash")._id, text: "Summer Showdown is going to be intense. See you all there.", targetType: "Tournament", targetId: upcomingTournament1._id },
  { authorId: u("midnightroller")._id, text: "A tournament at night? This was made for me.", targetType: "Tournament", targetId: upcomingTournament2._id },
  { authorId: u("rookierook")._id, text: "Rookie Rumble is perfect for me. Finally my time to shine!", targetType: "Tournament", targetId: upcomingTournament4._id },
  { authorId: u("straightDana")._id, text: "No straights allowed and I still signed up. I like pain.", targetType: "Tournament", targetId: upcomingTournament5._id },

  // Comments on completed tournaments
  { authorId: u("magnuscr")._id, text: "Autumn Classic was a great way to end the year. Thanks everyone!", targetType: "Tournament", targetId: completedTournament1._id },
  { authorId: u("ladyluck")._id, text: "Valentine's trophy is the best thing I've ever won. Lucky in dice, lucky in love.", targetType: "Tournament", targetId: completedTournament4._id },
  { authorId: u("blitzKrieg")._id, text: "New Year Blitz was my kind of tournament. Fast and deadly.", targetType: "Tournament", targetId: completedTournament3._id },

  // Comment on cancelled tournament
  { authorId: u("highroller88")._id, text: "I was the only one who signed up?? Come on people, live a little.", targetType: "Tournament", targetId: cancelledTournament2._id },
]);
console.log("Created 20 comments");

// ---- Award trophy to last year's winner ----
await User.findByIdAndUpdate(u("magnuscr")._id, {
  $push: {
    trophies: {
      title: "Autumn Champion Trophy",
      imageUrl: "/uploads/trophy.jpg",
      wonAt: new Date("2025-10-03"),
    },
  },
});
console.log("Awarded trophy to magnuscr");

await User.findByIdAndUpdate(u("NoMercy")._id, {
  $push: {
    trophies: {
      title: "Winter Freeze Trophy",
      imageUrl: "/uploads/trophy.jpg",
      wonAt: new Date("2025-12-17"),
    },
  },
});
console.log("Awarded trophy to NoMercy");

await User.findByIdAndUpdate(u("blitzKrieg")._id, {
  $push: {
    trophies: {
      title: "New Year Blitz Trophy",
      imageUrl: "/uploads/trophy.jpg",
      wonAt: new Date("2026-01-04"),
    },
  },
});
console.log("Awarded trophy to blitzKrieg");

await User.findByIdAndUpdate(u("ladyluck")._id, {
  $push: {
    trophies: {
      title: "Valentine's Dice Trophy",
      imageUrl: "/uploads/trophy.jpg",
      wonAt: new Date("2026-02-16"),
    },
  },
});
console.log("Awarded trophy to ladyluck");

await User.findByIdAndUpdate(u("cafeplayer")._id, {
  $push: {
    trophies: {
      title: "March Madness Trophy",
      imageUrl: "/uploads/trophy.jpg",
      wonAt: new Date("2026-03-22"),
    },
  },
});

console.log("\nSeed complete!");
console.log(`   ${users.length} users (login with any email + 'password123')`);
console.log(`   Admin: admin@test.com / password123`);
console.log(`   ${completedMatches.length + ongoingMatches.length + waitingMatches.length} matches`);

await mongoose.disconnect();
process.exit(0);
