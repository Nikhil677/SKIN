import { describe, it, expect } from "vitest";
import {
  PageSnapshotSchema,
  TaskModelSchema,
  UISpecSchema,
  ActionRequestSchema,
  ActionResultSchema,
  ProfileSchema,
  DEFAULT_PROFILE,
} from "../../packages/shared/src/index.js";

describe("Shared Contracts & Schemas", () => {
  it("validates a standard PageSnapshot", () => {
    const validSnapshot = {
      schemaVersion: "1.0",
      snapshotId: "snap_001",
      capturedAt: new Date().toISOString(),
      origin: "http://localhost:5173",
      title: "Pension Portal",
      lang: "en",
      headings: [{ level: 1, text: "Pension Application" }],
      groups: [{ ref: "g_1", kind: "fieldset", legend: "Personal Info", fieldRefs: ["f_001"] }],
      fields: [
        {
          ref: "f_001",
          tag: "input",
          type: "text",
          role: "textbox",
          accessibleName: "Full Name",
          nameSource: "label",
          nameConfidence: "high",
          description: "Enter your full name as per Aadhaar",
          required: true,
          constraints: { maxLength: 80 },
          state: { disabled: false, readOnly: false, invalid: false },
          sensitivity: "none",
          groupRef: "g_1",
          visible: true,
        },
      ],
      tables: [],
      messages: [],
      actions: [{ ref: "a_01", kind: "submit", accessibleName: "Submit Application", destructive: "unknown" }],
      diagnostics: { unlabeledFields: 0, truncated: false },
    };

    const parsed = PageSnapshotSchema.safeParse(validSnapshot);
    expect(parsed.success).toBe(true);
  });

  it("validates a TaskModel", () => {
    const validTask = {
      schemaVersion: "1.0",
      taskKind: "form",
      title: "Update Pension Details",
      steps: [
        {
          stepId: "step_1",
          fieldRefs: ["f_001"],
          required: true,
          groupLabel: "Personal Details",
          errorRefs: [],
          confidence: "high",
        },
      ],
      finalActionRef: "a_01",
      finalActionDestructive: "unknown",
    };

    const parsed = TaskModelSchema.safeParse(validTask);
    expect(parsed.success).toBe(true);
  });

  it("validates a valid UISpec", () => {
    const validSpec = {
      schemaVersion: "1.0",
      language: "en",
      sourceLanguage: "en",
      task: {
        title: "Pension Application",
        totalSteps: 2,
        kind: "form",
      },
      steps: [
        {
          stepId: "step_1",
          index: 1,
          title: "Your Full Name",
          component: {
            type: "QuestionText",
            prompt: "What is your full name?",
            hint: "As written on your pension card or Aadhaar.",
            inputMode: "text",
            speakAs: "plain",
          },
          bindings: [{ fieldRef: "f_001", role: "value" }],
          originalText: { label: "Full Name", lang: "en" },
          sensitivity: "none",
          required: true,
        },
        {
          stepId: "step_2",
          index: 2,
          title: "Review & Submit",
          component: {
            type: "ReviewSummary",
            title: "Please review your answers",
            editLabel: "Change",
          },
          bindings: [],
          required: false,
        },
      ],
    };

    const parsed = UISpecSchema.safeParse(validSpec);
    expect(parsed.success).toBe(true);
  });

  it("rejects malicious UISpec with script or HTML tag injection", () => {
    const maliciousSpec = {
      schemaVersion: "1.0",
      language: "en",
      sourceLanguage: "en",
      task: {
        title: "Malicious Form",
        totalSteps: 1,
        kind: "form",
      },
      steps: [
        {
          stepId: "step_1",
          index: 1,
          title: "Malicious Input",
          component: {
            type: "QuestionText",
            prompt: "<script>alert('xss')</script>Enter your name",
            inputMode: "text",
            speakAs: "plain",
          },
          bindings: [{ fieldRef: "f_001", role: "value" }],
          sensitivity: "none",
          required: true,
        },
      ],
    };

    const parsed = UISpecSchema.safeParse(maliciousSpec);
    expect(parsed.success).toBe(false);
  });

  it("validates ActionRequest and ActionResult contracts", () => {
    const request = {
      schemaVersion: "1.0",
      actionId: "act_101",
      type: "setValue",
      fieldRef: "f_001",
      value: "Savitri Devi",
      origin: "user_confirmed",
      requiresConfirmation: false,
    };
    expect(ActionRequestSchema.safeParse(request).success).toBe(true);

    const result = {
      schemaVersion: "1.0",
      actionId: "act_101",
      status: "ok",
      strategyUsed: "native_setter",
      observed: { value: "Savitri Devi", invalid: false },
      hostMessages: [],
      timestamp: new Date().toISOString(),
    };
    expect(ActionResultSchema.safeParse(result).success).toBe(true);
  });

  it("validates Profile and default fallback", () => {
    expect(ProfileSchema.safeParse(DEFAULT_PROFILE).success).toBe(true);
  });
});
