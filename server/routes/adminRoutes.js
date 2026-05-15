import express from "express";
import { body } from "express-validator";
import { roles } from "../../shared/constants.js";
import { requireAuth, authorize } from "../middleware/auth.js";
import { validateRequest } from "../middleware/validate.js";
import { addAuditLog, listAuditLogs, listUsers, updateUser } from "../services/dataService.js";

const router = express.Router();

router.use(requireAuth);

router.get("/users", authorize("Admin", "Manager"), async (_req, res, next) => {
  try {
    res.json({ data: await listUsers() });
  } catch (error) {
    next(error);
  }
});

router.patch(
  "/users/:id",
  authorize("Admin"),
  [body("role").optional().isIn(roles).withMessage("Invalid role."), body("isActive").optional().isBoolean().withMessage("Invalid active state.")],
  validateRequest,
  async (req, res, next) => {
    try {
      const user = await updateUser(req.params.id, req.body);
      if (!user) return res.status(404).json({ message: "User not found." });
      await addAuditLog({ actor: req.user, action: "update", entity: "User", entityId: req.params.id, metadata: req.body, ip: req.ip });
      res.json({ data: user });
    } catch (error) {
      next(error);
    }
  },
);

router.get("/audit-logs", authorize("Admin", "Manager"), async (_req, res, next) => {
  try {
    res.json({ data: await listAuditLogs() });
  } catch (error) {
    next(error);
  }
});

export default router;
