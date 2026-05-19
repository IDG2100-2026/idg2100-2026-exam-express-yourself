// require('dotenv').config(); // this will load the .env file so we can use process.env variables
import express from "express";
import { errorHandler } from "./src/middlewares/errorMiddleware.js";
import { setUserType } from "./src/middlewares/authMiddleware.js";
import cors from "cors";
import userRouter from "./src/routes/userRoutes.js";
import tournamentRouter from "./src/routes/tournamentRoutes.js";
import matchRouter from "./src/routes/matchRoutes.js";
import commentsRouter from "./src/routes/commentRoutes.js";
import leaderboardRouter from "./src/routes/leaderboardRoutes.js";
import helmet from "helmet";
import { connectDB, disconnectDB } from "./src/config/db.js";

const app = express();

// this will set secure http headers automatically, helps protect against common attacks like clickjacking
app.use(helmet());

// this will allow requests from other origins, needed if the frontend runs on a different port
app.use(cors());

await connectDB();

// this will parse incoming json bodies so we can read req.body
app.use(express.json());

// this will parse form data from requests
app.use(express.urlencoded({ extended: true }));

// this will serve uploaded files like trophy images as static files from the uploads folder
app.use("/uploads", express.static("uploads"));

// this will run on every request and attach userType and userId to req
app.use(setUserType);

// this will register all the api routes
app.use("/api/users", userRouter);
app.use("/api/matches", matchRouter);
app.use("/api/tournaments", tournamentRouter);
app.use("/api/comments", commentsRouter);
app.use("/api/leaderboard", leaderboardRouter);

// this will catch any request that does not match a route above
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
}); // TODO: put this into its own folder! SOC

// this will catch any errors passed with next(err) from controllers
app.use(errorHandler);

const httpServer = app.listen(process.env.BACKEND_PORT);
httpServer.on("listening", () => {
  console.log("Server is listening on port:", httpServer.address().port);
});

async function gracefulShutdown() {
  console.log("\nServer is shutting down...");
  await disconnectDB();
  httpServer.close(() => {
    console.log("Server has shut down!");
    process.exit(0);
  });
}

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);