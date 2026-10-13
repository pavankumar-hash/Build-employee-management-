import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/auth.middleware.js";
import {
  registerController,
  loginController,
} from "../controllers/auth.controller.js";

const router = Router();

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

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

router.post("/register", registerLimiter, registerController);
router.post("/login", loginLimiter, loginController);
router.get("/me", authenticateToken, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Authenticated successfully",
    user: req.user,
  });
});

router.get(
  "/admin-test",
  authenticateToken,
  authorizeRoles("admin"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Admin access granted",
      user: req.user,
    });
  },
);
export default router;
