import { z } from "zod";

export const HeadingSchema = z.object({
  level: z.number().int().min(1).max(6),
  text: z.string().trim().max(300),
});

export const GroupSchema = z.object({
  ref: z.string(),
  kind: z.enum(["fieldset", "section", "div", "form"]),
  legend: z.string(),
  fieldRefs: z.array(z.string()),
});

export const NameSourceSchema = z.enum([
  "label",
  "aria-labelledby",
  "aria-label",
  "placeholder",
  "title",
  "nearby-text",
  "none",
]);

export const NameConfidenceSchema = z.enum(["high", "medium", "low"]);

export const SensitivitySchema = z.enum([
  "none",
  "unknown",
  "password",
  "otp",
  "national_id",
  "payment_card",
  "bank_account",
  "date_of_birth",
  "contact",
]);

export const FieldConstraintSchema = z.object({
  pattern: z.string().nullable().optional(),
  minLength: z.number().int().nullable().optional(),
  maxLength: z.number().int().nullable().optional(),
  min: z.union([z.string(), z.number()]).nullable().optional(),
  max: z.union([z.string(), z.number()]).nullable().optional(),
  step: z.union([z.string(), z.number()]).nullable().optional(),
  options: z
    .array(
      z.object({
        value: z.string(),
        label: z.string(),
      })
    )
    .nullable()
    .optional(),
});

export const FieldStateSchema = z.object({
  disabled: z.boolean().default(false),
  readOnly: z.boolean().default(false),
  invalid: z.boolean().default(false),
  checked: z.boolean().optional(),
  currentValue: z.string().optional(), // In-memory/read-back only; stripped before outbound
});

export const FieldSnapshotSchema = z.object({
  ref: z.string(),
  tag: z.string(),
  type: z.string(),
  role: z.string().default("textbox"),
  accessibleName: z.string().default(""),
  nameSource: NameSourceSchema.default("none"),
  nameConfidence: NameConfidenceSchema.default("low"),
  description: z.string().default(""),
  required: z.boolean().default(false),
  constraints: FieldConstraintSchema.default({}),
  state: FieldStateSchema.default({ disabled: false, readOnly: false, invalid: false }),
  sensitivity: SensitivitySchema.default("none"),
  groupRef: z.string().nullable().optional(),
  visible: z.boolean().default(true),
});

export const TableColumnSchema = z.object({
  ref: z.string(),
  label: z.string(),
  key: z.string().optional(),
});

export const TableRowSchema = z.object({
  ref: z.string(),
  cells: z.record(z.string(), z.string()), // columnRef -> formatted cell text
});

export const TableSnapshotSchema = z.object({
  ref: z.string(),
  caption: z.string().default(""),
  columns: z.array(TableColumnSchema),
  rows: z.array(TableRowSchema),
});

export const ActionSnapshotSchema = z.object({
  ref: z.string(),
  kind: z.enum(["submit", "button", "link", "reset"]),
  accessibleName: z.string(),
  destructive: z.enum(["safe", "destructive", "unknown"]).default("unknown"),
});

export const PageSnapshotSchema = z.object({
  schemaVersion: z.literal("1.0"),
  snapshotId: z.string(),
  capturedAt: z.string(),
  origin: z.string(),
  title: z.string(),
  lang: z.string().default("en"),
  headings: z.array(HeadingSchema).default([]),
  groups: z.array(GroupSchema).default([]),
  fields: z.array(FieldSnapshotSchema).default([]),
  tables: z.array(TableSnapshotSchema).default([]),
  messages: z.array(z.string()).default([]),
  actions: z.array(ActionSnapshotSchema).default([]),
  diagnostics: z.object({
    unlabeledFields: z.number().default(0),
    truncated: z.boolean().default(false),
  }).default({ unlabeledFields: 0, truncated: false }),
});

export type PageSnapshot = z.infer<typeof PageSnapshotSchema>;
export type FieldSnapshot = z.infer<typeof FieldSnapshotSchema>;
export type TableSnapshot = z.infer<typeof TableSnapshotSchema>;
export type ActionSnapshot = z.infer<typeof ActionSnapshotSchema>;
export type Sensitivity = z.infer<typeof SensitivitySchema>;
