import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Employee name is required"],
      trim: true,
      minlength: [2, "Name must contain at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email"],
    },

    department: {
      type: String,
      required: [true, "Department is required"],
      enum: [
        "Engineering",
        "HR",
        "Finance",
        "Marketing",
        "Sales",
        "Operations",
        "Other",
      ],
    },

    salary: {
      type: Number,
      required: [true, "Salary is required"],
      min: [0, "Salary cannot be negative"],
      validate: {
        validator: Number.isFinite,
        message: "Salary must be a finite number",
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;
