import express from "express";
import { listFeedback } from "../services/dataService.js";
import { buildDashboardAnalytics } from "../services/analyticsService.js";

const router = express.Router();

router.get("/summary", async (req, res, next) => {
  try {
    const records = await listFeedback(req.query);
    res.json({ data: buildDashboardAnalytics(records).summary });
  } catch (error) {
    next(error);
  }
});

router.get("/charts", async (req, res, next) => {
  try {
    const records = await listFeedback(req.query);
    res.json({ data: buildDashboardAnalytics(records).charts });
  } catch (error) {
    next(error);
  }
});

router.get("/recent", async (req, res, next) => {
  try {
    const records = await listFeedback(req.query);
    res.json({ data: buildDashboardAnalytics(records).recent });
  } catch (error) {
    next(error);
  }
});

export default router;
