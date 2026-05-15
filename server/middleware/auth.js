import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { findUserById, publicUser } from "../services/dataService.js";

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : req.cookies?.token;
    if (!token) return res.status(401).json({ message: "Please log in to continue." });

    const decoded = jwt.verify(token, env.jwtSecret);
    const user = await findUserById(decoded.sub);
    if (!user) return res.status(401).json({ message: "Your session is no longer valid." });

    req.user = publicUser(user);
    next();
  } catch {
    res.status(401).json({ message: "Your session expired. Please log in again." });
  }
}

export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Please log in to continue." });
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "You do not have permission to access this page." });
    }
    next();
  };
}
