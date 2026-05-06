import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().min(1, "Email address is required").email("Please enter a valid email address"),
    password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
    email: z.string().min(1, "Email address is required").email("Please enter a valid email address"),
    password: z.string()
        .min(8, "Password must be at least 8 characters long")
        .max(128, "Password must not exceed 128 characters"),
    role: z.string().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
