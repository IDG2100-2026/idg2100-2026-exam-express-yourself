import { verifyAccessToken } from "../utils/jwt.js";
import { BusinessLogicError } from "../utils/errors.js";
import { logIncident } from "../services/security-incidents-service.js";
import { normalizeIp } from "../utils/normalize-ip.js";


export const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) throw new BusinessLogicError("Access token required", 401);

    const decoded = verifyAccessToken(token);

    // IP-change detection. log incident and force new login
    if (decoded.ip && decoded.ip !== normalizeIp(req.ip)) {
      logIncident({
        type: "ip-change",
        ip: req.ip,
        userAgent: req.headers["user-agent"] || "unknown",
        userId: decoded.userId || null,
      }).catch(() => {}); // fire and forget, don't block the request

      throw new BusinessLogicError("IP mismatch, please re-authenticate", 401);
    }

    req.userId = decoded.userId;
    req.role = decoded.role;
    next();
  } catch (err) {
    next(err);
  }
};


// Sets req.userId and req.role if a valid token is present, but never blocks the request
export const optionalAuthenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (token) {
      const decoded = verifyAccessToken(token);
      req.userId = decoded.userId;
      req.role = decoded.role;
    }
  } catch {
    // invalid or missing token on a public route, just continue
  }
  next();
};


export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.role))
      throw new BusinessLogicError("Insufficient permissions", 403);
    next();
  };
};
