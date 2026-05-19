import mongoose from "mongoose";

const { DB_NAME, DB_PORT, DB_HOSTNAME } = process.env;

const MONGODB_URI = `mongodb://${DB_HOSTNAME}:${DB_PORT}/${DB_NAME}`;

export async function connectDB() {
  if (DB_NAME && DB_PORT && DB_HOSTNAME) {
    mongoose.connection.on("error", (err) => {
      console.error("Unhandled MongoDB / mongoose connection error: ", err);
    });
    console.log("Connecting to MongoDB now..", MONGODB_URI);
    return mongoose.connect(MONGODB_URI, {
      appName: DB_NAME,
      maxPoolSize: 50, // Current request MongoDB can be queued at the same time
    });
  }
  throw new Error(
    `Missing env variables needed to connect to MongoDB ${DB_HOSTNAME}, ${DB_PORT}, ${DB_NAME}`,
  );
}

export async function disconnectDB() {
  return mongoose.disconnect();
}

export default {
  disconnectDB,
  connectDB,
};
