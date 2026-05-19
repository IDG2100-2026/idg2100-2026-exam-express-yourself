import express from 'express';
import { connectDB, disconnectDB } from './config/db.config.js';
import userRouter from './routes/userRoute.js';
import tournamentRoute from './routes/tournamentRoute.js';
import gameRoute from './routes/gameRoute.js';
import commentRoute from './routes/commentRoute.js';
import activityRoute from './routes/activityRoute.js';
import leaderboardRoute from './routes/leaderboardRoute.js';
import cors from 'cors';
import loginRoute from './routes/loginRoute.js';
const app = express();

app.use(express.json());
app.use(cors());

await connectDB();

app.use("/api", tournamentRoute, userRouter, gameRoute, commentRoute, activityRoute, leaderboardRoute, loginRoute );

const httpServer = app.listen(process.env.BACKEND_APP_PORT);
httpServer.on("listening", () => {
    console.log("Server is listening on port:", httpServer.address().port);
});


async function gracefulShutdown(){
    console.log("\nServer is shutting down...");
    await disconnectDB();
    httpServer.close(() => {
        console.log("Server has shut down!");
        process.exit(0); 
    });
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

