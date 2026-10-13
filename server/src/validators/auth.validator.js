import { z } from "zod";

const registerSchema = z
  .object({
    name: z.string().trim().min(2).max(100),
    email: z
      .string()
      .trim()
      .email()
      .max(254)
      .transform((value) => value.toLowerCase()),
    password: z
      .string()
      .min(8)
      .refine(
        (value) => Buffer.byteLength(value, "utf8") <= 72,
        "Password must not exceed 72 bytes",
      ),
  })
  .strict();

const loginSchema = z
  .object({
    email: z
      .string()
      .trim()
      .email()
      .max(254)
      .transform((value) => value.toLowerCase()),
    password: z.string().min(1, "Password is required"),
  })
  .strict();

export { registerSchema, loginSchema };
