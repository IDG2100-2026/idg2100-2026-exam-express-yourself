import express from "express";
import path from "path";
import errorHandler from "./src/middlewares/error-middleware.js";
import cors from "cors";
import userRouter from "./src/routes/user-routes.js";
import tournamentRouter from "./src/routes/tournament-routes.js";
import matchRouter from "./src/routes/match-routes.js";
import commentsRouter from "./src/routes/comment-routes.js";
import leaderboardRouter from "./src/routes/leaderboard-routes.js";
import authRouter from "./src/routes/auth-routes.js";
import helmet from "helmet";
import { connectDB, disconnectDB } from "./src/config/db.js";
import platformActivityRouter from "./src/routes/platform-activity-routes.js";
import { setupWebSocket } from "./src/websockets/websocket.js";
import { apiRateLimiter } from "./src/middlewares/rate-limiter.js";
import securityIncidentsRouter from "./src/routes/security-incidents-routes.js";
import { scheduleWeeklyTopup } from "./src/utils/weekly-topup.js";

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);

await connectDB();
scheduleWeeklyTopup();

// Parse JSON bodies
app.use(express.json());

// Serve uploaded files, trophy images and avatar images
app.use("/uploads", express.static(path.join(import.meta.dirname, "uploads")));

app.use("/api/auth", authRouter);


app.use("/api", apiRateLimiter); // Apply rate limiter to all other API routes
app.use("/api/users", userRouter);
app.use("/api/matches", matchRouter);
app.use("/api/tournaments", tournamentRouter);
app.use("/api/comments", commentsRouter);
app.use("/api/leaderboard", leaderboardRouter);
app.use("/api/platform-activity", platformActivityRouter);
app.use("/api/security-incidents", securityIncidentsRouter);


app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Centralized error handler
app.use(errorHandler);

const httpServer = app.listen(process.env.BACKEND_APP_PORT);
setupWebSocket(httpServer);

httpServer.on("listening", () => {
  console.log("Server is listening on port:", httpServer.address().port);
});

// Graceful shutdown, closes DB connection before stopping
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