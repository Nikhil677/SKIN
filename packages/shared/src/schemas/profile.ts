import { z } from "zod";

export const LanguageCodeSchema = z.enum(["en", "hi", "ta", "te", "bn", "mr"]);

export const TextSizeSchema = z.enum(["large", "larger", "largest"]);

export const ContrastModeSchema = z.enum(["standard", "high"]);

export const ProfileSchema = z.object({
  schemaVersion: z.literal("1.0"),
  language: LanguageCodeSchema.default("en"),
  textSize: TextSizeSchema.default("larger"),
  contrast: ContrastModeSchema.default("standard"),
  voiceOutput: z.boolean().default(true),
  voiceInput: z.boolean().default(true),
  speechRate: z.number().min(0.5).max(2.0).default(1.0),
  autoReadAloud: z.boolean().default(true),
  screenReaderMode: z.boolean().default(false),
  disclosuresAccepted: z.object({
    llm: z.boolean().default(true),
    speech: z.boolean().default(true),
  }).default({ llm: true, speech: true }),
});

export type Profile = z.infer<typeof ProfileSchema>;
export type LanguageCode = z.infer<typeof LanguageCodeSchema>;
export type TextSize = z.infer<typeof TextSizeSchema>;
export type ContrastMode = z.infer<typeof ContrastModeSchema>;

export const DEFAULT_PROFILE: Profile = {
  schemaVersion: "1.0",
  language: "en",
  textSize: "larger",
  contrast: "standard",
  voiceOutput: true,
  voiceInput: true,
  speechRate: 1.0,
  autoReadAloud: true,
  screenReaderMode: false,
  disclosuresAccepted: {
    llm: true,
    speech: true,
  },
};
