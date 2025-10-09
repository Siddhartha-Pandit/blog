import mongoose, { Mongoose } from "mongoose";
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}
interface CachedMongoose {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}
let cached = (global as any).mongoose as CachedMongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}
async function dbConnect(): Promise<Mongoose> {
  if (cached.conn) {
    console.log("Using cached database connection.");
    return cached.conn;
  }
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    console.log("Establishing new database connection...");
    cached.promise = mongoose.connect(MONGODB_URI!, opts);
  }

  try {
    cached.conn = await cached.promise;
    console.log("Database connected successfully.");
  } catch (e) {
    cached.promise = null;
    console.error("Database connection failed:", e);
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
