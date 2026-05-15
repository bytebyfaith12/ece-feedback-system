import { validationResult } from "express-validator";

export function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Please check the highlighted fields and try again.",
      errors: errors.array().map((error) => ({ field: error.path, message: error.msg })),
    });
  }
  next();
}
