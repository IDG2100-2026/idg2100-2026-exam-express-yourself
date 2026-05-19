import express from "express";
import { connectDB, disconnectDB } from "./config/db-config.js"; //import db connection functions
import cors from "cors";

//routes
import userRouter from "./routes/user-routes.js";
import matchRouter from "./routes/match-routes.js";
import tournamentRouter from "./routes/tournament-routes.js";
import commentRouter from "./routes/comment-routes.js";
import trophyRouter from "./routes/trophy-routes.js";

const app = express(); //create the server app

//global middleware
app.use(express.json()); //middleware that unstringifies the req body and puts it in req.body so we can work with it
app.use(cors());

app.use((req, res, next) => { //simple authentication middleware checking role through req header
    const role = req.headers.role || "anonymous"; //read header, default to anonymous if no role header
    req.role = role; //store role in req.role for routes to access later
    next(); //passes the req baton forward
});

//mount routes, define base paths
app.use("/api/users", userRouter);
app.use("/api/matches", matchRouter);
app.use("/api/tournaments", tournamentRouter);
app.use("/api/comments", commentRouter);
app.use("/api/trophies", trophyRouter);

app.get("/", (req, res) => { //health check, GET / to verify the API is responding
    res.status(200).json({ message: "API is running" });
});

//connect to db and start server
await connectDB();
const httpServer = app.listen(process.env.BACKEND_APP_PORT, () => {
    console.log(`Server is running on port ${process.env.BACKEND_APP_PORT}`);
});

//graceful shutdown, closes db connection before stopping the server, approach from course material (repo: idg2100.backend.lt)
async function gracefulShutDown() {
    console.log("SERVER SHUTTING DOWN...");
    await disconnectDB();
    httpServer.close(() => {
        process.exit(0); //stop the node process
    });
}
process.on("SIGINT", gracefulShutDown); //triggered when ctrl+c in terminal
process.on("SIGTERM", gracefulShutDown); //triggered when process is stopped from outside