import mongoose from "mongoose";
import Employee from "../models/employee.model.js";

export async function createEmployee(employeeData) {
  return Employee.create(employeeData);
}

export async function getAllEmployees(query = {}) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);

  const requestedLimit = Number.parseInt(query.limit, 10) || 10;
  const limit = Math.min(100, Math.max(1, requestedLimit));

  const filter = {};

  // Search by employee name or email
  if (typeof query.search === "string" && query.search.trim()) {
    const searchTerm = query.search.trim().slice(0, 100);

    // Escape special regex characters
    const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    filter.$or = [
      { name: { $regex: escapedTerm, $options: "i" } },
      { email: { $regex: escapedTerm, $options: "i" } },
    ];
  }

  // Filter by department
  const allowedDepartments = [
    "Engineering",
    "HR",
    "Finance",
    "Marketing",
    "Sales",
    "Operations",
    "Other",
  ];

  if (query.department) {
    if (!allowedDepartments.includes(query.department)) {
      const error = new Error("Invalid department");
      error.statusCode = 400;
      throw error;
    }

    filter.department = query.department;
  }

  // Filter by salary range
  if (query.minSalary !== undefined || query.maxSalary !== undefined) {
    const minSalary =
      query.minSalary === undefined ? undefined : Number(query.minSalary);

    const maxSalary =
      query.maxSalary === undefined ? undefined : Number(query.maxSalary);

    if (
      (minSalary !== undefined &&
        (!Number.isFinite(minSalary) || minSalary < 0)) ||
      (maxSalary !== undefined &&
        (!Number.isFinite(maxSalary) || maxSalary < 0)) ||
      (minSalary !== undefined &&
        maxSalary !== undefined &&
        minSalary > maxSalary)
    ) {
      const error = new Error("Invalid salary range");
      error.statusCode = 400;
      throw error;
    }

    filter.salary = {};

    if (minSalary !== undefined) {
      filter.salary.$gte = minSalary;
    }

    if (maxSalary !== undefined) {
      filter.salary.$lte = maxSalary;
    }
  }

  // Allow only approved sort fields
  const allowedSortFields = ["createdAt", "name", "salary"];

  const sortBy = allowedSortFields.includes(query.sortBy)
    ? query.sortBy
    : "createdAt";

  const sortOrder = query.order === "asc" ? 1 : -1;
  const skip = (page - 1) * limit;

  const [employees, total] = await Promise.all([
    Employee.find(filter)
      .sort({ [sortBy]: sortOrder, _id: 1 })
      .skip(skip)
      .limit(limit),

    Employee.countDocuments(filter),
  ]);

  return {
    employees,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    },
  };
}

export async function getEmployeeById(id) {
  if (!mongoose.isValidObjectId(id)) {
    const error = new Error("Invalid employee ID");
    error.statusCode = 400;
    throw error;
  }

  const employee = await Employee.findById(id);

  if (!employee) {
    const error = new Error("Employee not found");
    error.statusCode = 404;
    throw error;
  }

  return employee;
}

export async function updateEmployee(id, employeeData) {
  if (!mongoose.isValidObjectId(id)) {
    const error = new Error("Invalid employee ID");
    error.statusCode = 400;
    throw error;
  }

  const employee = await Employee.findByIdAndUpdate(id, employeeData, {
    new: true,
    runValidators: true,
  });

  if (!employee) {
    const error = new Error("Employee not found");
    error.statusCode = 404;
    throw error;
  }

  return employee;
}

export async function deleteEmployee(id) {
  if (!mongoose.isValidObjectId(id)) {
    const error = new Error("Invalid employee ID");
    error.statusCode = 400;
    throw error;
  }

  const employee = await Employee.findByIdAndDelete(id);

  if (!employee) {
    const error = new Error("Employee not found");
    error.statusCode = 404;
    throw error;
  }

  return employee;
}
