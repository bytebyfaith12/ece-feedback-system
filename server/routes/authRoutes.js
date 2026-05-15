import express from "express";
import jwt from "jsonwebtoken";
import { body } from "express-validator";
import { roles } from "../../shared/constants.js";
import { env } from "../config/env.js";
import { requireAuth } from "../middleware/auth.js";
import { validateRequest } from "../middleware/validate.js";
import { addAuditLog, createUser, findUserByEmail, publicUser, verifyPassword } from "../services/dataService.js";

const router = express.Router();

function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

router.post(
  "/signup",
  [
    body("fullName").trim().isLength({ min: 2 }).withMessage("Full name is required."),
    body("email").isEmail().withMessage("Please enter a valid email."),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters."),
    body("role").optional().isIn(roles).withMessage("Invalid role."),
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const user = await createUser(req.body);
      await addAuditLog({ actor: user, action: "signup", entity: "User", entityId: user.id, ip: req.ip });
      res.status(201).json({ user, token: signToken(user) });
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/login",
  [body("email").isEmail().withMessage("Please enter your email."), body("password").notEmpty().withMessage("Password is required.")],
  validateRequest,
  async (req, res, next) => {
    try {
      const user = await findUserByEmail(req.body.email);
      const valid = await verifyPassword(user, req.body.password);
      if (!valid) return res.status(401).json({ message: "Invalid email or password." });
      const safeUser = publicUser(user);
      await addAuditLog({ actor: safeUser, action: "login", entity: "User", entityId: safeUser.id, ip: req.ip });
      res.json({ user: safeUser, token: signToken(safeUser) });
    } catch (error) {
      next(error);
    }
  },
);

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

export default router;
