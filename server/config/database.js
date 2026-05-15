import mongoose from "mongoose";
import { env } from "./env.js";

export let isMongoConnected = false;

export async function connectDatabase() {
  if (!env.mongoUri) {
    console.log("MongoDB URI not configured. Using persistent local JSON fallback.");
    return false;
  }

  try {
    await mongoose.connect(env.mongoUri);
    isMongoConnected = true;
    console.log("Connected to MongoDB.");
    return true;
  } catch (error) {
    isMongoConnected = false;
    if (!env.localFallback) throw error;
    console.warn("MongoDB connection failed. Using persistent local JSON fallback.");
    console.warn(error.message);
    return false;
  }
}
