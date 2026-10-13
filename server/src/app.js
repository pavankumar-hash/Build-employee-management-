import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/auth.routes.js";
import employeeRoutes from "./routes/employee.routes.js";
import { errorMiddleware } from "./middleware/error.middleware.js";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  }),
);

app.use(express.json({ limit: "10kb" }));

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Employee Management API is running",
  });
});

app.use("/api/v1/employees", employeeRoutes);
app.use("/api/v1/auth", authRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use(errorMiddleware);

export default app;
