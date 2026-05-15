import express from "express";
import PDFDocument from "pdfkit";
import { Parser } from "json2csv";
import { requireAuth } from "../middleware/auth.js";
import { listFeedback } from "../services/dataService.js";
import { buildReportSummary } from "../services/analyticsService.js";

const router = express.Router();

router.get("/summary", requireAuth, async (req, res, next) => {
  try {
    const records = await listFeedback(req.query);
    res.json({ data: buildReportSummary(records), records });
  } catch (error) {
    next(error);
  }
});

router.get("/export/csv", requireAuth, async (req, res, next) => {
  try {
    const records = await listFeedback(req.query);
    const parser = new Parser({
      fields: ["feedbackId", "fullName", "employeeOrVisitorId", "role", "site", "floor", "accountDepartment", "category", "rating", "ratingScore", "status", "assignedTeam", "comment", "createdAt"],
    });
    const csv = records.length ? parser.parse(records) : parser.parse([]);
    res.header("Content-Type", "text/csv");
    res.attachment("ece-pulse-feedback-report.csv");
    res.send(csv);
  } catch (error) {
    next(error);
  }
});

router.get("/export/pdf", requireAuth, async (req, res, next) => {
  try {
    const records = await listFeedback(req.query);
    const summary = buildReportSummary(records);
    const doc = new PDFDocument({ margin: 48 });
    res.header("Content-Type", "application/pdf");
    res.attachment("ece-pulse-feedback-report.pdf");
    doc.pipe(res);
    doc.fontSize(20).text("ECE Pulse Feedback Report", { bold: true });
    doc.moveDown();
    doc.fontSize(12).text(`Total responses: ${summary.totalFeedback}`);
    doc.text(`Satisfaction percentage: ${summary.satisfactionRate}%`);
    doc.text(`Unsatisfied count: ${summary.unsatisfiedFeedback}`);
    doc.text(`Open action items: ${summary.openActionItems}`);
    doc.moveDown();
    doc.fontSize(14).text("Recent comments");
    if (!summary.commentsSummary.length) doc.fontSize(11).text("No comments yet.");
    summary.commentsSummary.forEach((comment) => doc.fontSize(10).text(`- ${comment}`));
    doc.end();
  } catch (error) {
    next(error);
  }
});

export default router;
