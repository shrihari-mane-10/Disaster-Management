import { z } from 'zod';
export declare const registerSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    password: z.ZodString;
    role: z.ZodDefault<z.ZodEnum<["citizen", "volunteer", "authority", "admin"]>>;
    lat: z.ZodOptional<z.ZodNumber>;
    lng: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    password: string;
    role: "citizen" | "volunteer" | "authority" | "admin";
    phone?: string | undefined;
    lat?: number | undefined;
    lng?: number | undefined;
}, {
    name: string;
    email: string;
    password: string;
    phone?: string | undefined;
    role?: "citizen" | "volunteer" | "authority" | "admin" | undefined;
    lat?: number | undefined;
    lng?: number | undefined;
}>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
