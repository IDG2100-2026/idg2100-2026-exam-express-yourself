import User from "../models/User.js";
import Match from "../models/Match.js";
import Tournament from "../models/Tournament.js";
import Comment from "../models/Comment.js";
import Trophy from "../models/Trophy.js";
import userRawData from "./data/users.json" with { type: "json" };
import matchRawData from "./data/matches.json" with { type: "json" };
import tournamentRawData from "./data/tournaments.json" with { type: "json" };
import commentRawData from "./data/comments.json" with { type: "json" };
import trophyRawData from "./data/trophies.json" with { type: "json" };

import { connectDB, disconnectDB } from "../config/db-config.js";

await connectDB(); //connect to db first

//clear all collections first
await User.deleteMany({});
await Match.deleteMany({});
await Tournament.deleteMany({});
await Comment.deleteMany({});
await Trophy.deleteMany({});
console.log("Cleared all collections");

//insert new users using .save() to ensure validation hooks run (checking all schema rules are followed before saving)
const userDocs = userRawData.map((userPojo) => { return new User(userPojo); });
await Promise.all(userDocs.map((userDoc) => { return userDoc.save(); }));
console.log("Users seeded");


const matchesWithPlayers = [ //add player ids to each match, waiting matches only have playerOne since playerTwo hasnt joined yet
    { ...matchRawData[0], playerOne: userDocs[0]._id },
    { ...matchRawData[1], playerOne: userDocs[1]._id },
    { ...matchRawData[2], playerOne: userDocs[2]._id },
    { ...matchRawData[3], playerOne: userDocs[3]._id },
    { ...matchRawData[4], playerOne: userDocs[0]._id, playerTwo: userDocs[4]._id },
    { ...matchRawData[5], playerOne: userDocs[1]._id, playerTwo: userDocs[5]._id },
    { ...matchRawData[6], playerOne: userDocs[2]._id, playerTwo: userDocs[6]._id },
    { ...matchRawData[7], playerOne: userDocs[3]._id, playerTwo: userDocs[7]._id },
    { ...matchRawData[8], playerOne: userDocs[4]._id, playerTwo: userDocs[8]._id },
    { ...matchRawData[9], playerOne: userDocs[5]._id, playerTwo: userDocs[0]._id },
];

await Match.insertMany(matchesWithPlayers.map((matchPojo) => { return new Match(matchPojo); }));
console.log("Matches seeded");

await Tournament.insertMany(tournamentRawData.map((tournamentPojo) => { return new Tournament(tournamentPojo); }));
console.log("Tournaments seeded");

await Comment.insertMany(commentRawData);
console.log("Comments seeded");

await Trophy.insertMany(trophyRawData);
console.log("Trophies seeded");

await disconnectDB();
console.log("Database seeded successfully");

//approach from course material (repo: idg2100.backend.lt)