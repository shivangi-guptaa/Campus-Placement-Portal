import dotenv from "dotenv";
import path from "path";

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), "backend", ".env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === "") {
  console.error("❌ FATAL CONFIGURATION ERROR: JWT_SECRET environment variable is missing!");
  throw new Error("FATAL CONFIGURATION ERROR: JWT_SECRET environment variable is missing. Server cannot start without a secure JWT_SECRET.");
}

export const JWT_SECRET = process.env.JWT_SECRET;
export const REFRESH_SECRET = process.env.REFRESH_SECRET || JWT_SECRET;
