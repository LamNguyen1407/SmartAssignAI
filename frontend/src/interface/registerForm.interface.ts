import {z} from 'zod'

export enum Gender {
    MALE = 'male',
    FEMALE = 'female',
    OTHER = 'other'
}

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(50, "Full name cannot exceed 50 characters"),
  email: z.string().refine((value) => {
    // Custom validation logic for email
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value);
  }, "Invalid email format"),
  password: z
    .string()
    .min(6, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must include at least one uppercase letter")
    .regex(/[a-z]/, "Password must include at least one lowercase letter")
    .regex(/[0-9]/, "Password must include at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must include at least one special character"),
  username: z
    .string()
    .min(4, "Username must be at least 4 characters")
    .max(20, "Username cannot exceed 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  gender: z.enum(Gender),
  phoneNumber: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^(\+?\d{7,15})$/.test(val),
      "Invalid phone number format (must be 7–15 digits, may include +)"
    ),

  // preprocess rõ ràng: chấp nhận string (date input), Date, undefined, null
  dateOfBirth: z
    .union([z.date(), z.string(), z.undefined(), z.null()])
    .optional()
    .transform((val) => {
      if (!val) return undefined;
      if (val instanceof Date) return val;
      if (typeof val === "string") {
        const d = new Date(val);
        return isNaN(d.getTime()) ? undefined : d;
      }
      return undefined;
    })
    .refine((date) => !date || date <= new Date(), "Date of birth cannot be in the future"),

  avatarUrl: z
    .string()
    .refine((value) => /^\S+:\/\/.+/.test(value),"Invalid avatar URL")
    .optional(),
});

export type RegisterSchema = z.infer<typeof registerSchema>