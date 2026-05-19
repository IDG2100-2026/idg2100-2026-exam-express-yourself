import mongoose from "mongoose";
import { User } from "../models/user.js";
import { Game } from "../models/game.js";
import { Tournament } from "../models/tournament.js";
import { Comment } from "../models/comments.js";

await mongoose.connect("mongodb://localhost:27017/spanish-poker-api");

[User, Game, Tournament, Comment].forEach(async (model) => {
  const res = await model.deleteMany({});
  console.log("Deleted from", model.modelName, res);
});

// Users
const Emil = await User.create({
  username: "Emil",
  email: "emil@test.com",
  pwd: "EmilsPassword123!",
  age: 20,
  eloRating: 2867,
});
const Sara = await User.create({
  username: "Sara",
  email: "sara@test.com",
  pwd: "SarasPassword123!",
  age: 22,
  eloRating: 3700,
});
const Tobias = await User.create({
  username: "Tobias",
  email: "tobias@test.com",
  pwd: "TobiasPassword123!",
  age: 23,
  eloRating: 860,
});
const Lena = await User.create({
  username: "Lena",
  email: "lena@test.com",
  pwd: "LenasPassword123!",
  age: 27,
  eloRating: 1490,
});
const Jonas = await User.create({
  username: "Jonas",
  email: "jonas@test.com",
  pwd: "JonasPassword123!",
  age: 24,
  eloRating: 1498,
});
const Mira = await User.create({
  username: "Mira",
  email: "mira@test.com",
  pwd: "MirasPassword123!",
  age: 30,
  eloRating: 2999,
});
const Hanna = await User.create({
  username: "Hanna",
  email: "hanna@test.com",
  pwd: "HannasPassword123!",
  age: 21,
  eloRating: 1400,
});
const Maxemann = await User.create({
  username: "Maxemann",
  email: "maxemann@test.com",
  pwd: "MaxemannsPassword123!",
  age: 25,
  eloRating: 3000,
});
const Kristian = await User.create({
  username: "Kristian",
  email: "kristian@test.com",
  pwd: "KristianPassword123!",
  age: 26,
  eloRating: 1300,
});
const Ingrid = await User.create({
  username: "Ingrid",
  email: "ingrid@test.com",
  pwd: "IngridPassword123!",
  age: 29,
  eloRating: 2465,
});
const Fredrik = await User.create({
  username: "Fredrik",
  email: "fredrik@test.com",
  pwd: "FredriksPassword123!",
  age: 31,
  eloRating: 1100,
});
const Camilla = await User.create({
  username: "Camilla",
  email: "camilla@test.com",
  pwd: "CamillasPassword123!",
  age: 19,
  eloRating: 1244,
});
const Petter = await User.create({
  username: "Petter",
  email: "petter@test.com",
  pwd: "PettersPassword123!",
  age: 34,
  eloRating: 1460,
});
const Silje = await User.create({
  username: "Silje",
  email: "silje@test.com",
  pwd: "SiljesPassword123!",
  age: 22,
  eloRating: 1085,
});
const Anders = await User.create({
  username: "Anders",
  email: "anders@test.com",
  pwd: "AndersPassword123!",
  age: 27,
  eloRating: 1290,
});
const Stian = await User.create({
  username: "Stian",
  email: "stian@test.com",
  pwd: "StiansPassword123!",
  age: 20,
  eloRating: 3800,
});
const Thea = await User.create({
  username: "Thea",
  email: "thea@test.com",
  pwd: "TheasPassword123!",
  age: 23,
  eloRating: 2000,
});
const Magnus = await User.create({
  username: "Magnus",
  email: "magnus@test.com",
  pwd: "MagnusPassword123!",
  age: 31,
  eloRating: 1350,
});
const Vilde = await User.create({
  username: "Vilde",
  email: "vilde@test.com",
  pwd: "VildesPassword123!",
  age: 21,
  eloRating: 1035,
});
const Rook = await User.create({
  username: "Rook",
  email: "rook@test.com",
  pwd: "rookePassord123!",
  age: 35,
  eloRating: 1500,
});
const Kliff = await User.create({
  username: "Kliff",
  email: "Kliff@test.com",
  pwd: "KliffPassord123!",
  age: 35,
  eloRating: 1500,
});
const Yann = await User.create({
  username: "yann",
  email: "yann@test.com",
  pwd: "yannPassord123!",
  age: 35,
  eloRating: 1900,
});
const Onka = await User.create({
  username: "onka",
  email: "onka@test.com",
  pwd: "KliffPassord123!",
  age: 35,
  eloRating: 2000,
});
const Marius = await User.create({
  username: "marius",
  email: "marius@test.com",
  pwd: "mariusPassord123!",
  age: 35,
  eloRating: 3000,
});
const Naira = await User.create({
  username: "naira",
  email: "naira@test.com",
  pwd: "nairaPassord123!",
  age: 31,
  eloRating: 1100,
});
const Marqize = await User.create({
  username: "Marqize",
  email: "marqize@test.com",
  pwd: "MarqizePassord123!",
  age: 31,
  eloRating: 1300,
});



const game1 = await Game.create({
  players: [{ userId: Thea._id }, { userId: Vilde._id }],
  variant: { rounds: 5, straightAllowed: true, timeControl: 10 },
  status: "Finished",
  isAnonymous: false,
  startedAt: new Date("2026-04-22T12:00:00Z"),
  endedAt: new Date("2026-04-22T12:30:00Z"),
  outcome: { winner: Thea._id, draw: false },
});
const game2 = await Game.create({
  players: [{ userId: Magnus._id }, { userId: Stian._id }],
  variant: { rounds: 7, straightAllowed: true, timeControl: 10 },
  status: "Finished",
  isAnonymous: false,
  startedAt: new Date("2026-04-22T15:27:00Z"),
  endedAt: new Date("2026-04-22T15:34:00Z"),
  outcome: { winner: Magnus._id, draw: false },
});
const game3 = await Game.create({
  players: [{ userId: Rook._id }, { userId: Maxemann._id }],
  variant: { rounds: 3, straightAllowed: false, timeControl: 30 },
  status: "Finished",
  isAnonymous: false,
  startedAt: new Date("2026-04-20T10:00:00Z"),
  endedAt: new Date("2026-04-20T10:15:00Z"),
  outcome: { winner: Maxemann._id, draw: false },
});

const game4 = await Game.create({
  players: [{ userId: Ingrid._id }, { userId: Fredrik._id }],
  variant: { rounds: 7, straightAllowed: true, timeControl: 30 },
  status: "Ongoing",
  isAnonymous: false,
  startedAt: new Date("2026-04-23T14:00:00Z"),
  endedAt: null,
  outcome: { winner: null, draw: false },
});
const game5 = await Game.create({
  players: [{ userId: Emil._id }, { userId: Sara._id }],
  variant: { rounds: 3, straightAllowed: true, timeControl: 3 },
  status: "Ongoing",
  isAnonymous: false,
  startedAt: new Date("2026-04-23T15:00:00Z"),
  endedAt: null,
  outcome: { winner: null, draw: false },
});
const game6 = await Game.create({
  players: [{ userId: Anders._id }, { userId: Camilla._id }],
  variant: { rounds: 7, straightAllowed: true, timeControl: 10 },
  status: "Ongoing",
  isAnonymous: false,
  startedAt: new Date("2026-04-23T14:30:00Z"),
  endedAt: null,
  outcome: { winner: null, draw: false },
});
const game7 = await Game.create({
  players: [{ userId: Petter._id }, { userId: Lena._id }],
  variant: { rounds: 5, straightAllowed: true, timeControl: 3 },
  status: "Ongoing",
  isAnonymous: false,
  startedAt: new Date("2026-04-23T14:20:00Z"),
  endedAt: null,
  outcome: { winner: null, draw: false },
});
const game8 = await Game.create({
  players: [{ userId: Kristian._id }, { userId: Kliff._id }],
  variant: { rounds: 7, straightAllowed: true, timeControl: 30 },
  status: "Ongoing",
  isAnonymous: false,
  startedAt: new Date("2026-04-23T17:00:00Z"),
  endedAt: null,
  outcome: { winner: null, draw: false },
});
const game9 = await Game.create({
  players: [{ userId: Kristian._id }, { userId: Kliff._id }],
  variant: { rounds: 7, straightAllowed: true, timeControl: 30 },
  status: "Ongoing",
  isAnonymous: false,
  startedAt: new Date("2026-04-23T17:00:00Z"),
  endedAt: null,
  outcome: { winner: null, draw: false },
});


const game16 = await Game.create({
  players: [{ userId: Yann._id }],
  variant: { rounds: 5, straightAllowed: true, timeControl: 30 },
  status: "Upcoming",
  isAnonymous: false,
  startedAt: new Date("2026-04-23T17:00:00Z"),
  endedAt: null,
  outcome: { winner: null, draw: false },
});
const game17 = await Game.create({
  players: [{ userId: Onka._id }],
  variant: { rounds: 3, straightAllowed: true, timeControl: 10 },
  status: "Upcoming",
  isAnonymous: false,
  startedAt: new Date("2026-04-23T17:00:00Z"),
  endedAt: null,
  outcome: { winner: null, draw: false },
});
const game18 = await Game.create({
  players: [{ userId: Marius._id }],
  variant: { rounds: 7, straightAllowed: true, timeControl: 3 },
  status: "Upcoming",
  isAnonymous: false,
  startedAt: new Date("2026-04-23T17:00:00Z"),
  endedAt: null,
  outcome: { winner: null, draw: false },
});
const game19 = await Game.create({
  players: [{ userId: Naira._id }],
  variant: { rounds: 5, straightAllowed: true, timeControl: 10 },
  status: "Upcoming",
  isAnonymous: false,
  startedAt: new Date("2026-04-23T17:00:00Z"),
  endedAt: null,
  outcome: { winner: null, draw: false },
});
const game20 = await Game.create({
  players: [{ userId: Marqize._id }],
  variant: { rounds: 3, straightAllowed: true, timeControl: 30 },
  status: "Upcoming",
  isAnonymous: false,
  startedAt: new Date("2026-04-23T17:00:00Z"),
  endedAt: null,
  outcome: { winner: null, draw: false },
});





// Anonymous games under here
const game10 = await Game.create({
  players: [{userId: null}],
  variant: { rounds: 5, straightAllowed: true, timeControl: 3 },
  status: "Upcoming",
  isAnonymous: false,
  startedAt: new Date("2026-04-23T17:00:00Z"),
  endedAt: null,
  outcome: { winner: null, draw: false },
});


const game11 = await Game.create({
  players: [{ userId: null }],
  variant: { rounds: 7, straightAllowed: true, timeControl: 10 },
  status: "Upcoming",
  isAnonymous: true,
  allowAnonymousPlayers: true,
  startedAt: new Date("2026-04-23T17:00:00Z"),
  endedAt: null,
  outcome: { winner: null, draw: false },
});

const game12 = await Game.create({
  players: [{ userId: null }],
  variant: { rounds: 3, straightAllowed: true, timeControl: 30 },
  status: "Upcoming",
  isAnonymous: true,
  allowAnonymousPlayers: true,
  startedAt: new Date("2026-04-23T17:00:00Z"),
  endedAt: null,
  outcome: { winner: null, draw: false },
});
const game13 = await Game.create({
  players: [{ userId: null }],
  variant: { rounds: 5, straightAllowed: true, timeControl: 10 },
  status: "Upcoming",
  isAnonymous: true,
  allowAnonymousPlayers: true,
  startedAt: new Date("2026-04-23T17:00:00Z"),
  endedAt: null,
  outcome: { winner: null, draw: false },
});
const game14 = await Game.create({
  players: [{ userId: null }],
  variant: { rounds: 7, straightAllowed: true, timeControl: 3 },
  status: "Upcoming",
  isAnonymous: true,
  allowAnonymousPlayers: true,
  startedAt: new Date("2026-04-23T17:00:00Z"),
  endedAt: null,
  outcome: { winner: null, draw: false },
});
const game15 = await Game.create({
  players: [{ userId: null }],
  variant: { rounds: 5, straightAllowed: true, timeControl: 30 },
  status: "Upcoming",
  isAnonymous: true,
  allowAnonymousPlayers: true,
  startedAt: new Date("2026-04-23T17:00:00Z"),
  endedAt: null,
  outcome: { winner: null, draw: false },
});
console.log("Success");

await mongoose.disconnect();
