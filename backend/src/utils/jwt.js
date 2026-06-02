import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_TTL } from "../config/auth-config.js";
import { normalizeIp } from "./normalize-ip.js";

const JWT_SECRET = process.env.JWT_SECRET;

export const signedAccessToken = ({ userId, role, ip = null }) => {
  // create a signed access token containing userId and role
  return jwt.sign(
    {
      userId,
      role,
      ip,
    },
    JWT_SECRET,
    {
      expiresIn: ACCESS_TOKEN_TTL,
    },
  );
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, JWT_SECRET); // verifies that the token is valid
};

export const getAccessToken = (user, ip = null) => {
  return signedAccessToken({
    userId: user._id.toString(),
    role: user.role,
    ip: normalizeIp(ip),
  });
};
