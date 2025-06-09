import { z } from "zod/v4";

export const signInSchema = z.object({
  identifier: z
    .email({ error: "Invalid Email" })
    .min(1, { error: "Email is Required" }),
  password: z
    .string()
    .min(1, { error: "Password is required" })
    .min(8, { error: "Password must be atleast 8 charaters" }),
});
