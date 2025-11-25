import { z } from "zod";

export const loginSchema = z.object({
  identifier: z
    .string()
    .nonempty("Username or email is required"),
  password: z
    .string()
    .nonempty("Password is required")
});

export type LoginSchema = z.infer<typeof loginSchema>;
