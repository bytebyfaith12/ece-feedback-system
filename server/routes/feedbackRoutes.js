import express from "express";
import { body } from "express-validator";
import { feedbackCategories, feedbackStatuses, ratings, assignedTeams } from "../../shared/constants.js";
import { requireAuth } from "../middleware/auth.js";
import { upload, uploadUrl } from "../middleware/upload.js";
import { validateRequest } from "../middleware/validate.js";
import { addAuditLog, archiveFeedback, createFeedback, getFeedback, listFeedback, updateFeedback } from "../services/dataService.js";

const router = express.Router();
const requiredText = { min: 1, max: 160 };

router.post(
  "/",
  upload.single("attachment"),
  [
    body("fullName").trim().isLength({ min: 2 }).withMessage("Full name is required."),
    body("employeeOrVisitorId").trim().isLength({ min: 1 }).withMessage("Employee ID or visitor name is required."),
    body("role").trim().isLength(requiredText).withMessage("Role is required."),
    body("site").trim().isLength(requiredText).withMessage("Site is required."),
    body("floor").trim().isLength(requiredText).withMessage("Floor is required."),
    body("accountDepartment").trim().isLength(requiredText).withMessage("Account or department is required."),
    body("category").isIn(feedbackCategories).withMessage("Please choose a feedback category."),
    body("rating").isIn(ratings.map((rating) => rating.label)).withMessage("Please choose a rating."),
    body("comment").optional({ checkFalsy: true }).isLength({ max: 2000 }).withMessage("Comment is too long."),
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const record = await createFeedback({ ...req.body, attachmentUrl: uploadUrl(req.file) }, { userId: req.user?.id || null });
      await addAuditLog({ actor: req.user, action: "create", entity: "Feedback", entityId: record.feedbackId, ip: req.ip });
      res.status(201).json({ message: "Thank you for your feedback.", data: record });
    } catch (error) {
      next(error);
    }
  },
);

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const records = await listFeedback(req.query);
    res.json({ data: records });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const record = await getFeedback(req.params.id);
    if (!record) return res.status(404).json({ message: "Feedback record not found." });
    res.json({ data: record });
  } catch (error) {
    next(error);
  }
});

router.patch(
  "/:id",
  requireAuth,
  [
    body("status").optional().isIn(feedbackStatuses).withMessage("Invalid status."),
    body("assignedTeam").optional().isIn(assignedTeams).withMessage("Invalid assigned team."),
    body("adminNotes").optional({ checkFalsy: true }).isLength({ max: 2000 }).withMessage("Admin notes are too long."),
    body("resolutionNotes").optional({ checkFalsy: true }).isLength({ max: 2000 }).withMessage("Resolution notes are too long."),
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const updated = await updateFeedback(req.params.id, req.body);
      if (!updated) return res.status(404).json({ message: "Feedback record not found." });
      await addAuditLog({ actor: req.user, action: "update", entity: "Feedback", entityId: updated.feedbackId, metadata: req.body, ip: req.ip });
      res.json({ data: updated });
    } catch (error) {
      next(error);
    }
  },
);

router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const archived = await archiveFeedback(req.params.id);
    if (!archived) return res.status(404).json({ message: "Feedback record not found." });
    await addAuditLog({ actor: req.user, action: "archive", entity: "Feedback", entityId: archived.feedbackId, ip: req.ip });
    res.json({ data: archived });
  } catch (error) {
    next(error);
  }
});

export default router;
