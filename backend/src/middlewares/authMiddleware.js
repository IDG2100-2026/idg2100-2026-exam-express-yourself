// this file handles basic auth using request headers
// the client sends x-user-type and x-user-id with every request instead of tokens or sessions

import mongoose from "mongoose";

// this will read the headers and attach userType and userId to req
// so every route can access them without repeating this logic
export const setUserType = (req, _res, next) => {
  const userType = req.headers['x-user-type'] || 'anonymous'; // this will default to anonymous if no header is sent
  const rawId = req.headers['x-user-id'];

  const validId = mongoose.Types.ObjectId.isValid(rawId) ? rawId : null;

  // if the id is not a valid ObjectId, treat the request as anonymous regardless of x-user-type
  req.userId = validId;
  req.userType = validId ? userType : 'anonymous';

  next(); // this will pass control to the next middleware or route
};

// this will block the route if the user is not logged in
export const requireUser = (req, res, next) => {
  if (req.userType === 'anonymous') {
    return res.status(401).json({ error: 'You must be logged in' });
  }
  next();
};

// this will block the route if the user is not an admin
export const requireAdmin = (req, res, next) => {
  if (req.userType !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};
