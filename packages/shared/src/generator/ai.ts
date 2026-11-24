import { PageSnapshot } from "../schemas/snapshot.js";
import { TaskModel } from "../schemas/taskmodel.js";
import { Profile } from "../schemas/profile.js";
import { UISpec, UISpecSchema } from "../schemas/uispec.js";
import { generateDeterministicUISpec } from "./deterministic.js";

export interface AIProviderConfig {
  endpoint?: string;
  apiKey?: string;
  model?: string;
  timeoutMs?: number;
}

export class UISpecGenerationEngine {
  private config: AIProviderConfig;

  constructor(config: AIProviderConfig = {}) {
    this.config = config;
  }

  async generate(
    snapshot: PageSnapshot,
    taskModel: TaskModel,
    profile: Profile
  ): Promise<UISpec> {
    // 1. If no external endpoint/key provided, immediately return deterministic spec (<1ms)
    if (!this.config.endpoint && !this.config.apiKey) {
      return generateDeterministicUISpec(snapshot, taskModel, profile);
    }

    try {
      // 2. Build strictly structure-only payload (Zero personal data / values)
      const sanitizedStructure = this.buildStructureOnlyPayload(snapshot, taskModel, profile);

      // 3. Call AI endpoint with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeoutMs || 4000);

      const response = await fetch(this.config.endpoint || "/api/generate-spec", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(this.config.apiKey ? { Authorization: `Bearer ${this.config.apiKey}` } : {}),
        },
        body: JSON.stringify(sanitizedStructure),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`AI Gateway responded with status ${response.status}`);
      }

      const rawJson = await response.json();

      // 4. Validate output with Zod UISpecSchema
      const parsed = UISpecSchema.safeParse(rawJson);
      if (parsed.success) {
        // Semantic validation: Ensure all fieldRefs exist in snapshot
        const validRefs = new Set(snapshot.fields.map((f) => f.ref));
        const allRefsValid = parsed.data.steps.every((s) =>
          s.bindings.every((b) => validRefs.has(b.fieldRef))
        );
        if (allRefsValid) {
          return parsed.data;
        }
      }

      // Fallback on schema validation error
      return generateDeterministicUISpec(snapshot, taskModel, profile);
    } catch {
      // Fallback on network/model error
      return generateDeterministicUISpec(snapshot, taskModel, profile);
    }
  }

  /**
   * Structure-only serializer. Strips all values, balances, inputs or sensitive details (§16.2).
   */
  private buildStructureOnlyPayload(
    snapshot: PageSnapshot,
    taskModel: TaskModel,
    profile: Profile
  ) {
    return {
      title: snapshot.title,
      taskKind: taskModel.taskKind,
      language: profile.language,
      fields: snapshot.fields.map((f) => ({
        ref: f.ref,
        role: f.role,
        accessibleName: f.accessibleName,
        required: f.required,
        sensitivity: f.sensitivity,
        options: f.constraints.options?.map((o) => ({ value: o.value, label: o.label })),
      })),
      tableColumns: snapshot.tables[0]?.columns || [],
    };
  }
}
