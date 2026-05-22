import { validationResult, matchedData } from "express-validator";

// Shared middleware that checks for validation errors
export function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  req.validated = matchedData(req);
  next();
}
