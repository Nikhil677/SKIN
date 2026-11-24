// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { extractPageSnapshot } from "../../packages/shared/src/perception/snapshotter.js";
import { buildTaskModel } from "../../packages/shared/src/perception/taskmodel.js";
import { generateDeterministicUISpec } from "../../packages/shared/src/generator/deterministic.js";
import { UISpecGenerationEngine } from "../../packages/shared/src/generator/ai.js";
import { UISpecSchema } from "../../packages/shared/src/schemas/uispec.js";
import { DEFAULT_PROFILE } from "../../packages/shared/src/schemas/profile.js";

describe("UI Spec Generator Engine", () => {
  it("generates a valid UISpec for Government Pension Form in English and Hindi", () => {
    document.body.innerHTML = `
      <h1>Pension Application Portal</h1>
      <form>
        <fieldset>
          <legend>Personal Details</legend>
          <label for="name">Full Name *</label>
          <input id="name" type="text" required />

          <label for="aadhaar">Aadhaar Number *</label>
          <input id="aadhaar" type="text" pattern="[0-9]{12}" required />

          <label for="gender">Gender *</label>
          <select id="gender" required>
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>
        </fieldset>

        <label>
          <input id="consent" type="checkbox" required />
          I declare that information is true
        </label>

        <button type="submit">Submit Form</button>
      </form>
    `;

    const snapshot = extractPageSnapshot({ root: document.body });
    const taskModel = buildTaskModel(snapshot);

    // English spec
    const enSpec = generateDeterministicUISpec(snapshot, taskModel, {
      ...DEFAULT_PROFILE,
      language: "en",
    });

    const parsedEn = UISpecSchema.safeParse(enSpec);
    expect(parsedEn.success).toBe(true);
    expect(enSpec.task.kind).toBe("form");
    // Steps: Name, Aadhaar, Gender, Consent, ReviewSummary, ConfirmAction -> 6 steps
    expect(enSpec.steps.length).toBe(6);

    // Aadhaar step should have digit_groups
    const aadhaarStep = enSpec.steps.find((s) => s.sensitivity === "national_id");
    expect(aadhaarStep).toBeDefined();
    if (aadhaarStep?.component.type === "QuestionText") {
      expect(aadhaarStep.component.speakAs).toBe("digit_groups");
      expect(aadhaarStep.component.groupSize).toBe(4);
    }

    // Hindi spec (Savitri persona journey)
    const hiSpec = generateDeterministicUISpec(snapshot, taskModel, {
      ...DEFAULT_PROFILE,
      language: "hi",
    });

    const parsedHi = UISpecSchema.safeParse(hiSpec);
    expect(parsedHi.success).toBe(true);
    expect(hiSpec.language).toBe("hi");
    const hiAadhaar = hiSpec.steps.find((s) => s.sensitivity === "national_id");
    expect(hiAadhaar?.title).toBe("आपका आधार नंबर");
  });

  it("generates a valid UISpec for Bank Statement Table", () => {
    document.body.innerHTML = `
      <h1>Apex Commercial Bank</h1>
      <table>
        <caption>Account Statement</caption>
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>2026-11-20</td>
            <td>Apollo Pharmacy Medicines</td>
            <td>₹ 1,420.00</td>
          </tr>
        </tbody>
      </table>
    `;

    const snapshot = extractPageSnapshot({ root: document.body });
    const taskModel = buildTaskModel(snapshot);

    const spec = generateDeterministicUISpec(snapshot, taskModel, DEFAULT_PROFILE);
    const parsed = UISpecSchema.safeParse(spec);
    expect(parsed.success).toBe(true);
    expect(spec.task.kind).toBe("table");
    expect(spec.steps[0].component.type).toBe("RecordList");
  });

  it("fallback engine returns deterministic spec when offline or unconfigured", async () => {
    document.body.innerHTML = `
      <h1>Simple Page</h1>
      <input id="test" type="text" />
    `;
    const snapshot = extractPageSnapshot({ root: document.body });
    const taskModel = buildTaskModel(snapshot);

    const engine = new UISpecGenerationEngine();
    const spec = await engine.generate(snapshot, taskModel, DEFAULT_PROFILE);
    expect(spec).toBeDefined();
    expect(UISpecSchema.safeParse(spec).success).toBe(true);
  });
});
