import { z } from "zod";

export const TaskKindSchema = z.enum(["form", "table", "mixed", "unknown"]);

export const TaskStepSchema = z.object({
  stepId: z.string(),
  fieldRefs: z.array(z.string()),
  required: z.boolean().default(false),
  groupLabel: z.string().optional(),
  errorRefs: z.array(z.string()).default([]),
  confidence: z.enum(["high", "medium", "low"]).default("high"),
});

export const TaskModelSchema = z.object({
  schemaVersion: z.literal("1.0"),
  taskKind: TaskKindSchema,
  title: z.string(),
  steps: z.array(TaskStepSchema),
  finalActionRef: z.string().nullable().optional(),
  finalActionDestructive: z.enum(["safe", "destructive", "unknown"]).default("unknown"),
});

export type TaskModel = z.infer<typeof TaskModelSchema>;
export type TaskStep = z.infer<typeof TaskStepSchema>;
export type TaskKind = z.infer<typeof TaskKindSchema>;
