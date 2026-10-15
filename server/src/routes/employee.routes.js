import { Router } from "express";

import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/auth.middleware.js";

import {
  createEmployeeController,
  getAllEmployeesController,
  getEmployeeByIdController,
  updateEmployeeController,
  deleteEmployeeController,
  getEmployeeDashboardController,
} from "../controllers/employee.controller.js";

const router = Router();

// GET all employees — login required
router
  .route("/")
  .get(authenticateToken, getAllEmployeesController)
  .post(authenticateToken, authorizeRoles("admin"), createEmployeeController);
router.get(
  "/dashboard/summary",
  authenticateToken,
  authorizeRoles("admin"),
  getEmployeeDashboardController,
);
// GET, UPDATE and DELETE a single employee
router
  .route("/:id")
  .get(authenticateToken, getEmployeeByIdController)
  .patch(authenticateToken, authorizeRoles("admin"), updateEmployeeController)
  .delete(authenticateToken, authorizeRoles("admin"), deleteEmployeeController);

export default router;
