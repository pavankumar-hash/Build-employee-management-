import { Router } from "express";
import { rateLimit } from "express-rate-limit";

import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

import {
  registerController,
  loginController,
  getCurrentUserController,
  updateProfileController,
} from "../controllers/auth.controller.js";

const router = Router();

// ==============================
// REGISTER RATE LIMITER
// ==============================
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many registration attempts. Please try again later.",
  },
});

// ==============================
// LOGIN RATE LIMITER
// ==============================
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Please try again later.",
  },
});

// ==============================
// PUBLIC AUTH ROUTES
// ==============================

// Register a new user
router.post("/register", registerLimiter, registerController);

// Login user
router.post("/login", loginLimiter, loginController);

// ==============================
// AUTHENTICATED USER ROUTES
// ==============================

// Get the currently logged-in user's profile
router.get("/me", authenticateToken, getCurrentUserController);

// Update the currently logged-in user's profile
router.patch("/profile", authenticateToken, updateProfileController);

// ==============================
// ADMIN-ONLY ROUTES
// ==============================

// Test admin authorization
router.get(
  "/admin-test",
  authenticateToken,
  authorizeRoles("admin"),
  (req, res) => {
    return res.status(200).json({
      success: true,
      message: "Admin access granted",
      user: req.user,
    });
  },
);

export default router;
