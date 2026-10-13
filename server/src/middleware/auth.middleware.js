import jwt from "jsonwebtoken";
import { ISSUER, AUDIENCE } from "../utils/tokens.js";

export function authenticateToken(req, res, next) {
  try {
    const authorization = req.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access token is required",
      });
    }

    const token = authorization.slice(7).trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token is required",
      });
    }

    const secret = process.env.ACCESS_TOKEN_SECRET;

    if (!secret || secret.length < 32) {
      return res.status(500).json({
        success: false,
        message: "Authentication configuration error",
      });
    }

    const payload = jwt.verify(token, secret, {
      algorithms: ["HS256"],
      issuer: ISSUER,
      audience: AUDIENCE,
    });

    if (
      typeof payload === "string" ||
      !payload.sub ||
      !["admin", "employee"].includes(payload.role)
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid access token",
      });
    }

    req.user = {
      id: payload.sub,
      role: payload.role,
    };

    next();
  } catch (error) {
    if (
      ["TokenExpiredError", "JsonWebTokenError", "NotBeforeError"].includes(
        error.name,
      )
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired access token",
      });
    }

    next(error);
  }
}

export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this resource",
      });
    }

    next();
  };
}
