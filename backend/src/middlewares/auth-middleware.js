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
