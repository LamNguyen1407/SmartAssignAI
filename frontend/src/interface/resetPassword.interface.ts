import z from "zod";


export interface IResetPassword {
    token: string;
    password: string;
}

export const resetPasswordSchema = z.object({
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(20, "Password must be at most 20 characters")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).+$/, "Password must include at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 special character"),
});

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;