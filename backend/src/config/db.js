import mongoose from "mongoose";

const { DB_HOSTNAME, DB_PORT, DB_NAME, NODE_ENV } = process.env;

const MONGODB_URI = `mongodb://${DB_HOSTNAME}:${DB_PORT}/${DB_NAME}`;

export async function connectDB() {
  if (DB_HOSTNAME && DB_PORT && DB_NAME) {
    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });
    console.log("Connecting to MongoDB...", MONGODB_URI);
    return mongoose.connect(MONGODB_URI, {
      appName: `${DB_NAME}-${NODE_ENV}`,
    });
  }
  throw new Error(
    `Missing env variables needed to connect to MongoDB: DB_HOSTNAME, DB_PORT, DB_NAME`
  );
}

export async function disconnectDB() {
  return mongoose.disconnect();
}
