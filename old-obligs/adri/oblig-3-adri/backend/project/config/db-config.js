import mongoose from "mongoose";
//.env file loaded through npm dev script and makes environment variables available in process.env

//db connection config, approach from course material (repo: idg2100.backend.lt)
const { DB_HOSTNAME, DB_PORT, DB_NAME, NODE_ENV } = process.env; //destructure env variables
const CONNECTION_URI = `mongodb://${DB_HOSTNAME}:${DB_PORT}/${DB_NAME}`; //build connection string from env variables

export async function connectDB() {
    if (DB_HOSTNAME && DB_PORT && DB_NAME) { //only attempt connection if all required env variables are present
        mongoose.connection.on("error", (err) => {
            console.error("Unhandled MongoDB connection error:", err);
        });
        console.log("Connecting to MongoDB...", CONNECTION_URI);
        return mongoose.connect(CONNECTION_URI, {
            appName: DB_NAME + "-" + NODE_ENV, //identifies the app in MongoDB logs
        });
    }
    throw new Error(`Missing env variables needed to connect to MongoDB: DB_HOSTNAME, DB_PORT, DB_NAME`);
}

export async function disconnectDB() {
    return mongoose.disconnect(); //closes the connection to MongoDB
}