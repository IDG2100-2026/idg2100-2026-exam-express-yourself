import mongoose from "mongoose";

// Reads headers and attaches userType and userId to req
export function setUserType(req, res, next) {
  const userType = req.headers["x-user-type"] || "anonymous";
  const rawId = req.headers["x-user-id"];

  const validId = mongoose.Types.ObjectId.isValid(rawId) ? rawId : null;

  // If the id is not a valid ObjectId, treat as anonymous
  req.userId = validId;
  req.userType = validId ? userType : "anonymous";

  next();
}

// Block route if user is not logged in
export function requireUser(req, res, next) {
  if (req.userType === "anonymous") {
    return res.status(401).json({ error: "You must be logged in" });
  }
  next();
}

// Block route if user is not an admin
export function requireAdmin(req, res, next) {
  if (req.userType !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}
