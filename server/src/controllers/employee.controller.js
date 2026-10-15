import {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  getEmployeeDashboardSummary,
} from "../services/employee.service.js";
import {
  employeeSchema,
  employeeUpdateSchema,
} from "../validators/employee.validator.js";

export async function createEmployeeController(req, res, next) {
  try {
    const validation = employeeSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.issues,
      });
    }

    const employee = await createEmployee(validation.data);

    return res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: employee,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An employee with this email already exists",
      });
    }

    next(error);
  }
}

export async function getAllEmployeesController(req, res, next) {
  try {
    const result = await getAllEmployees(req.query);

    return res.status(200).json({
      success: true,
      data: result.employees,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

export async function getEmployeeByIdController(req, res, next) {
  try {
    const employee = await getEmployeeById(req.params.id);

    return res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateEmployeeController(req, res, next) {
  try {
    const validation = employeeUpdateSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.issues,
      });
    }

    if (validation.data.email) {
      validation.data.email = validation.data.email.toLowerCase();
    }

    const employee = await updateEmployee(req.params.id, validation.data);

    return res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      data: employee,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An employee with this email already exists",
      });
    }

    next(error);
  }
}

export async function deleteEmployeeController(req, res, next) {
  try {
    const employee = await deleteEmployee(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Employee deleted successfully",
      data: employee,
    });
  } catch (error) {
    next(error);
  }
}

export async function getEmployeeDashboardController(req, res, next) {
  try {
    const summary = await getEmployeeDashboardSummary();

    return res.status(200).json({
      success: true,
      message: "Dashboard summary fetched successfully",
      data: summary,
    });
  } catch (error) {
    next(error);
  }
}
