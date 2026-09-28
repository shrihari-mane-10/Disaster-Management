import { z } from 'zod';
export declare const createIncidentSchema: z.ZodObject<{
    type: z.ZodString;
    description: z.ZodString;
    severity: z.ZodDefault<z.ZodEnum<["low", "medium", "high", "critical"]>>;
    lat: z.ZodNumber;
    lng: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    lat: number;
    lng: number;
    type: string;
    description: string;
    severity: "low" | "medium" | "high" | "critical";
}, {
    lat: number;
    lng: number;
    type: string;
    description: string;
    severity?: "low" | "medium" | "high" | "critical" | undefined;
}>;
export declare const updateIncidentSchema: z.ZodObject<{
    type: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    severity: z.ZodOptional<z.ZodEnum<["low", "medium", "high", "critical"]>>;
    status: z.ZodOptional<z.ZodEnum<["pending", "assigned", "in_progress", "resolved", "rejected"]>>;
    verified: z.ZodOptional<z.ZodBoolean>;
    lat: z.ZodOptional<z.ZodNumber>;
    lng: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    lat?: number | undefined;
    lng?: number | undefined;
    type?: string | undefined;
    status?: "pending" | "assigned" | "in_progress" | "resolved" | "rejected" | undefined;
    description?: string | undefined;
    severity?: "low" | "medium" | "high" | "critical" | undefined;
    verified?: boolean | undefined;
}, {
    lat?: number | undefined;
    lng?: number | undefined;
    type?: string | undefined;
    status?: "pending" | "assigned" | "in_progress" | "resolved" | "rejected" | undefined;
    description?: string | undefined;
    severity?: "low" | "medium" | "high" | "critical" | undefined;
    verified?: boolean | undefined;
}>;
export declare const incidentQuerySchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["pending", "assigned", "in_progress", "resolved", "rejected"]>>;
    severity: z.ZodOptional<z.ZodEnum<["low", "medium", "high", "critical"]>>;
    type: z.ZodOptional<z.ZodString>;
    verified: z.ZodOptional<z.ZodEffects<z.ZodString, boolean, string>>;
    limit: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    offset: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    type?: string | undefined;
    status?: "pending" | "assigned" | "in_progress" | "resolved" | "rejected" | undefined;
    limit?: number | undefined;
    severity?: "low" | "medium" | "high" | "critical" | undefined;
    verified?: boolean | undefined;
    offset?: number | undefined;
}, {
    type?: string | undefined;
    status?: "pending" | "assigned" | "in_progress" | "resolved" | "rejected" | undefined;
    limit?: number | undefined;
    severity?: "low" | "medium" | "high" | "critical" | undefined;
    verified?: string | undefined;
    offset?: number | undefined;
}>;
export type CreateIncidentInput = z.infer<typeof createIncidentSchema>;
export type UpdateIncidentInput = z.infer<typeof updateIncidentSchema>;
export type IncidentQueryInput = z.infer<typeof incidentQuerySchema>;
