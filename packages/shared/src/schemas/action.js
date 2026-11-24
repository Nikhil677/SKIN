import { z } from "zod";
export const ActionTypeSchema = z.enum([
    "setValue",
    "selectOption",
    "check",
    "uncheck",
    "click",
    "focus",
    "readBack",
]);
export const ActionOriginSchema = z.enum(["user_confirmed", "system_readback"]);
export const ActionRequestSchema = z.object({
    schemaVersion: z.literal("1.0"),
    actionId: z.string(),
    type: ActionTypeSchema,
    fieldRef: z.string(),
    value: z.union([z.string(), z.boolean(), z.number()]).optional(),
    origin: ActionOriginSchema,
    requiresConfirmation: z.boolean().default(false),
});
export const ActionStatusSchema = z.enum([
    "ok",
    "mismatch",
    "not_found",
    "stale",
    "blocked",
    "untrusted_event_rejected",
    "error",
]);
export const StrategyUsedSchema = z.enum([
    "native_setter",
    "keyboard_simulation",
    "click_handler",
    "direct_property",
    "none",
]);
export const ObservedStateSchema = z.object({
    value: z.union([z.string(), z.boolean(), z.number()]).optional(),
    invalid: z.boolean().default(false),
    checked: z.boolean().optional(),
});
export const ActionResultSchema = z.object({
    schemaVersion: z.literal("1.0"),
    actionId: z.string(),
    status: ActionStatusSchema,
    strategyUsed: StrategyUsedSchema,
    observed: ObservedStateSchema.optional(),
    hostMessages: z.array(z.string()).default([]),
    timestamp: z.string(),
});
