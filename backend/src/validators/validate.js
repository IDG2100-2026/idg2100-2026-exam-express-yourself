import { validationResult, matchedData } from "express-validator";

// Shared middleware to react to the data being invalid

export function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() }); // message to user to tell the data is invalid
  }
  req.validate = matchedData(req);
  next();
}

export default {
  validate,
};
