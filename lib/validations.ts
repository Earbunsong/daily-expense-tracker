import { z } from "zod";

const CURRENCIES = ["USD", "KHR"] as const;

export const registerSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export const expenseSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  currency: z.enum(CURRENCIES).default("USD"),
  categoryId: z.number().int(),
  spentAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  note: z.string().max(255).optional(),
});

export const budgetSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  amount: z.number().positive("Amount must be positive"),
  currency: z.enum(CURRENCIES).default("USD"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ExpenseInput = z.infer<typeof expenseSchema>;
export type BudgetInput = z.infer<typeof budgetSchema>;
