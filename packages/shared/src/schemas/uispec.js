import { z } from "zod";
import { SensitivitySchema } from "./snapshot.js";
// Closed set of 12 content components (§8.8 of Master Document)
export const ComponentTypeSchema = z.enum([
    "QuestionText",
    "QuestionDate",
    "QuestionChoice",
    "QuestionMulti",
    "QuestionConsent",
    "InfoBlock",
    "RecordList",
    "RecordDetail",
    "ReviewSummary",
    "ConfirmAction",
    "ErrorNotice",
    "HandoffNotice",
]);
// Component definitions
export const QuestionTextComponentSchema = z.object({
    type: z.literal("QuestionText"),
    prompt: z.string().max(240),
    hint: z.string().max(240).optional(),
    inputMode: z.enum(["text", "numeric", "tel", "email"]).default("text"),
    speakAs: z.enum(["plain", "digit_groups", "spell"]).default("plain"),
    groupSize: z.number().int().optional(),
    placeholder: z.string().max(100).optional(),
});
export const QuestionDateComponentSchema = z.object({
    type: z.literal("QuestionDate"),
    prompt: z.string().max(240),
    parts: z.enum(["dmy", "single"]).default("single"),
    hint: z.string().max(240).optional(),
});
export const ChoiceOptionSchema = z.object({
    value: z.string(),
    label: z.string().max(120),
});
export const QuestionChoiceComponentSchema = z.object({
    type: z.literal("QuestionChoice"),
    prompt: z.string().max(240),
    hint: z.string().max(240).optional(),
    options: z.array(ChoiceOptionSchema),
    display: z.enum(["buttons", "list"]).default("buttons"),
});
export const QuestionMultiComponentSchema = z.object({
    type: z.literal("QuestionMulti"),
    prompt: z.string().max(240),
    hint: z.string().max(240).optional(),
    options: z.array(ChoiceOptionSchema),
    minSelected: z.number().int().optional(),
});
export const QuestionConsentComponentSchema = z.object({
    type: z.literal("QuestionConsent"),
    prompt: z.string().max(240),
    statement: z.string().max(600),
    hint: z.string().max(240).optional(),
});
export const InfoBlockComponentSchema = z.object({
    type: z.literal("InfoBlock"),
    body: z.string().max(1000),
});
export const RecordListColumnSchema = z.object({
    ref: z.string(),
    label: z.string(),
});
export const RecordListComponentSchema = z.object({
    type: z.literal("RecordList"),
    title: z.string().max(120).optional(),
    columns: z.array(RecordListColumnSchema),
    emphasis: z.string().optional(), // column ref to highlight
    searchable: z.boolean().default(true),
    filterOptions: z.array(z.string()).optional(),
});
export const RecordDetailComponentSchema = z.object({
    type: z.literal("RecordDetail"),
    recordRef: z.string(),
    labels: z.record(z.string(), z.string()),
});
export const ReviewSummaryComponentSchema = z.object({
    type: z.literal("ReviewSummary"),
    title: z.string().max(120).default("Review your details"),
    editLabel: z.string().max(60).default("Change"),
});
export const ConfirmActionComponentSchema = z.object({
    type: z.literal("ConfirmAction"),
    consequence: z.string().max(300),
    actionRef: z.string(),
    confirmLabel: z.string().max(60).default("Confirm & Submit"),
    cancelLabel: z.string().max(60).default("Go Back"),
});
export const ErrorNoticeComponentSchema = z.object({
    type: z.literal("ErrorNotice"),
    message: z.string().max(400),
    fieldRef: z.string().optional(),
});
export const HandoffNoticeComponentSchema = z.object({
    type: z.literal("HandoffNotice"),
    reason: z.enum(["password", "otp", "captcha", "upload", "other"]),
    instruction: z.string().max(400),
});
export const ComponentSchema = z.discriminatedUnion("type", [
    QuestionTextComponentSchema,
    QuestionDateComponentSchema,
    QuestionChoiceComponentSchema,
    QuestionMultiComponentSchema,
    QuestionConsentComponentSchema,
    InfoBlockComponentSchema,
    RecordListComponentSchema,
    RecordDetailComponentSchema,
    ReviewSummaryComponentSchema,
    ConfirmActionComponentSchema,
    ErrorNoticeComponentSchema,
    HandoffNoticeComponentSchema,
]);
export const BindingSchema = z.object({
    fieldRef: z.string(),
    role: z.enum(["value", "day", "month", "year", "selection", "consent"]).default("value"),
});
export const OriginalTextSchema = z.object({
    label: z.string(),
    lang: z.string().default("en"),
    description: z.string().optional(),
});
export const UISpecStepSchema = z.object({
    stepId: z.string(),
    index: z.number().int().min(1),
    title: z.string().max(120),
    component: ComponentSchema,
    bindings: z.array(BindingSchema).default([]),
    originalText: OriginalTextSchema.optional(),
    sensitivity: SensitivitySchema.default("none"),
    required: z.boolean().default(false),
});
export const UISpecTaskSchema = z.object({
    title: z.string().max(160),
    totalSteps: z.number().int().min(1),
    kind: z.enum(["form", "table", "mixed"]),
});
// Full UI Spec schema (strictly validated, no arbitrary code, no HTML tags)
export const UISpecSchema = z
    .object({
    schemaVersion: z.literal("1.0"),
    language: z.string().default("en"),
    sourceLanguage: z.string().default("en"),
    task: UISpecTaskSchema,
    steps: z.array(UISpecStepSchema),
})
    .refine((spec) => {
    // Security check: Reject any HTML tag `<...>` or `javascript:` or `data:` schemes in text strings
    const jsonStr = JSON.stringify(spec);
    return !/<[a-z][\s\S]*>/i.test(jsonStr) && !/javascript:/i.test(jsonStr);
}, { message: "Security violation: UISpec cannot contain executable HTML markup or javascript URIs" });
