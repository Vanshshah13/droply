import * as z from "zod"

export const signUpSchema = z.object({
    email: z
        .string()
        .min(1, { message: "Email is Required" })
        .email({ message: "Please Enter a valid email" }),

    password: z
        .string()
        .min(1, { message: "Password is Required" })
        .min(8, { message: "Password should be minimum of 8 characters" }),

    passwordConfirmation: z
        .string()
        .min(1, { message: "Password confirm your Password" }),
})
    .refine((data) => data.password === data.passwordConfirmation, {
        message: "Password do not match",
        path: ["passwordConfirmation"]
    });