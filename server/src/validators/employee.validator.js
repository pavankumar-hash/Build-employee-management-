import { z } from "zod";

const departments = [
  "Engineering",
  "HR",
  "Finance",
  "Marketing",
  "Sales",
  "Operations",
  "Other",
];

const employeeSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must contain at least 2 characters")
      .max(100, "Name cannot exceed 100 characters"),

    email: z
      .string()
      .trim()
      .email("Please provide a valid email")
      .max(254)
      .transform((value) => value.toLowerCase()),

    department: z.enum(departments),

    salary: z.number().finite().nonnegative("Salary cannot be negative"),
  })
  .strict();

const employeeUpdateSchema = employeeSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required for update",
  });

export { employeeSchema, employeeUpdateSchema };
