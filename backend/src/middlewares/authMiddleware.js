// import mongoose from "mongoose";

// // Reads headers and attaches userType and userId to req
// export function setUserType(req, res, next) {
//   const userType = req.headers["x-user-type"] || "anonymous";
//   const rawId = req.headers["x-user-id"];

//   const validId = mongoose.Types.ObjectId.isValid(rawId) ? rawId : null;

//   // If the id is not a valid ObjectId, treat as anonymous
//   req.userId = validId;
//   req.userType = validId ? userType : "anonymous";

//   next();
// }

// // Block route if user is not logged in
// export function requireUser(req, res, next) {
//   if (req.userType === "anonymous") {
//     return res.status(401).json({ error: "You must be logged in" });
//   }
//   next();
// }

// // Block route if user is not an admin
// export function requireAdmin(req, res, next) {
//   if (req.userType !== "admin") {
//     return res.status(403).json({ error: "Admin access required" });
//   }
//   next();
// }

import { verifyAccessToken } from "../utils/jwt.js";
import { BusinessLogicError } from "../utils/errors.js";
export const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // get the token from authorization: bearer <token>
    if (!token) throw new BusinessLogicError("Access token required", 401); // no token

    const { userId, role } = verifyAccessToken(token); // verify the Jwt signature and check if it is valid.
    req.userId = userId;
    req.role = role;

    next(); // token is valid. go to next middleware or route handler
  } catch (err) {
    next(err); // global error handler
  }
};
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.role)) // check if the user's role is allowed
      throw new BusinessLogicError("Insufficient permissions", 403); // user is authenticated, but does not have permission to go here
    next(); // role is allowed
  };
};
