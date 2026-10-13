import jwt from "jsonwebtoken";

const ISSUER = "employee-management-api";
const AUDIENCE = "employee-management-client";

export function createAccessToken(user) {
  const secret = process.env.ACCESS_TOKEN_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "ACCESS_TOKEN_SECRET must be configured with a strong random secret",
    );
  }

  return jwt.sign({ role: user.role }, secret, {
    subject: user._id.toString(),
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m",
    issuer: ISSUER,
    audience: AUDIENCE,
    algorithm: "HS256",
  });
}

export { ISSUER, AUDIENCE };
