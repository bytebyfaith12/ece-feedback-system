import fs from "fs";
import multer from "multer";
import path from "path";
import { env } from "../config/env.js";

fs.mkdirSync(env.uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, env.uploadDir),
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "-");
    cb(null, `${Date.now()}-${safeName}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(file.mimetype)) {
      return cb(new Error("Only JPG, PNG, WEBP, or PDF attachments are allowed."));
    }
    cb(null, true);
  },
});

export function uploadUrl(file) {
  if (!file) return "";
  return `/uploads/${path.basename(file.filename)}`;
}
