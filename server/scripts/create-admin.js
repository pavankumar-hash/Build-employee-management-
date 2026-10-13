import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import { connectDB } from "../src/config/db.js";
import User from "../src/models/user.model.js";

async function createAdmin() {
  try {
    const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

    if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
      throw new Error(
        "ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env",
      );
    }

    if (ADMIN_PASSWORD.length < 12) {
      throw new Error("Admin password must be at least 12 characters");
    }

    await connectDB();

    const email = ADMIN_EMAIL.trim().toLowerCase();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log(
        "This email already exists. No changes were made. Choose a new admin email.",
      );
      return;
    }

    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

    const admin = await User.create({
      name: ADMIN_NAME.trim(),
      email,
      passwordHash,
      role: "admin",
      isActive: true,
    });

    console.log("Admin created successfully.");
    console.log("Admin ID:", admin._id.toString());
    console.log("Admin email:", admin.email);
    console.log("Role:", admin.role);
  } catch (error) {
    console.error("Admin setup failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

createAdmin();
