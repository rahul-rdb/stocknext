import { z } from "zod/v4";

export const signUpSchema = z
  .object({
    email: z
      .email({ error: "Invalid Email" })
      .min(1, { error: "Email is required" }),
    password: z
      .string()
      .min(1, { error: "Password is required" })
      .min(8, { error: "Password should be of minimum 8 charaters" }),
    passwordConfirmation: z
      .string()
      .min(1, { error: "Please confirm your password" }),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    error: "Password do not match.",
    path: ["passwordConfirmation"],
  });
