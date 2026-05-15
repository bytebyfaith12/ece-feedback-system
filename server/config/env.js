import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "../..");

export const env = {
  rootDir,
  port: Number(process.env.PORT || 4000),
  clientOrigin: process.env.CLIENT_ORIGIN || "http://127.0.0.1:5173",
  mongoUri: process.env.MONGODB_URI || "",
  jwtSecret: process.env.JWT_SECRET || "local-dev-change-this-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  uploadDir: path.resolve(rootDir, process.env.UPLOAD_DIR || "server/uploads"),
  localFallback: process.env.USE_LOCAL_JSON_FALLBACK !== "false",
};
