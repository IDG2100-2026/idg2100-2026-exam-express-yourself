import mongoose from "mongoose";

const { DATABASE_PORT, DATABASE_NAME, DATABASE_PROTOCOL, DATABASE_HOSTNAME } =
  process.env;

const MONGODB_URI = `${DATABASE_PROTOCOL}://${DATABASE_HOSTNAME}:${DATABASE_PORT}/${DATABASE_NAME}`;

export async function connectDB() {
  if (
    DATABASE_PORT &&
    DATABASE_NAME &&
    DATABASE_PROTOCOL &&
    DATABASE_HOSTNAME
  ) {
    mongoose.connection.on("error", (err) => {
      console.error("Unhandled MongoDB / mongoose connection error: ", err);
    });
    console.log("Connecting to MongoDB now..", MONGODB_URI);
    return mongoose.connect(MONGODB_URI, {
      appName: DB_NAME,
      maxPoolSize: 50, // Current request MongoDB can be queued at the same time
    });
    throw new Error(
      `Missing env variables needed to connect to MongoDB ${DATABASE_PROTOCOL} ${DB_HOSTNAME}, ${DB_PORT}, ${DB_NAME}`,
    );
  }
}
export async function disconnectDB() {
  return mongoose.disconnect();
}

export default {
  connectDB,
  disconnectDB,
};
