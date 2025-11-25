import z from "zod";

export const forgotPasswordSchema = z.object({
    email: z.email("Invalid email").nonempty("Email is required"),
});

export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;