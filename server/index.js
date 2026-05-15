import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import { env } from "./config/env.js";
import { connectDatabase } from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import metaRoutes from "./routes/metaRoutes.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

await connectDatabase();

const app = express();

app.set("trust proxy", 1);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use(
  cors({
    origin: env.clientOrigin,
    credentials: true,
  }),
);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 400,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());
app.use((req, _res, next) => {
  const clean = (value) => {
    if (Array.isArray(value)) return value.map(clean);
    if (value && typeof value === "object") {
      return Object.fromEntries(
        Object.entries(value)
          .filter(([key]) => !key.startsWith("$") && !key.includes("."))
          .map(([key, child]) => [key, clean(child)]),
      );
    }
    return value;
  };
  if (req.body) req.body = clean(req.body);
  next();
});
app.use(hpp());
app.use(morgan("dev"));

app.use("/uploads", express.static(env.uploadDir));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, app: "ECE Pulse Feedback System" });
});
app.use("/api/meta", metaRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/admin", adminRoutes);

const clientDist = path.resolve(__dirname, "../dist/client");
app.use(express.static(clientDist));
app.get(/^\/(?!api|uploads).*/, (_req, res) => {
  res.sendFile(path.join(clientDist, "index.html"), (error) => {
    if (error) res.status(404).json({ message: "Client app has not been built yet." });
  });
});

app.use(notFound);
app.use(errorHandler);

app.listen(env.port, "127.0.0.1", () => {
  console.log(`ECE Pulse API running on http://127.0.0.1:${env.port}`);
});
