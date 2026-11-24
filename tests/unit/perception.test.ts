// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import { extractPageSnapshot } from "../../packages/shared/src/perception/snapshotter.js";
import { buildTaskModel } from "../../packages/shared/src/perception/taskmodel.js";
import { ElementRegistry } from "../../packages/shared/src/bridge/registry.js";

describe("DOM Perception & Task Model Engine", () => {
  let registry: ElementRegistry;

  beforeEach(() => {
    registry = new ElementRegistry();
    document.body.innerHTML = "";
  });

  it("extracts fields, labels, constraints, and groups from Government Form markup", () => {
    document.body.innerHTML = `
      <h1>Ministry Pension Portal</h1>
      <form id="pension-form">
        <fieldset>
          <legend>Section 1: Beneficiary Identity</legend>
          <label for="name-input">Full Name of Beneficiary *</label>
          <input id="name-input" name="fullName" type="text" required maxlength="80" value="Savitri Devi" />

          <label for="aadhaar-input">Aadhaar Number (12 digits) *</label>
          <input id="aadhaar-input" name="aadhaarNumber" type="text" required maxlength="12" pattern="[0-9]{12}" />

          <label for="dob-input">Date of Birth *</label>
          <input id="dob-input" name="dob" type="date" required />

          <label for="gender-select">Gender *</label>
          <select id="gender-select" name="gender" required>
            <option value="">-- Select --</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>
        </fieldset>

        <label>
          <input id="consent-check" name="consent" type="checkbox" required />
          I declare that the information is true and accurate
        </label>

        <button type="submit" id="submit-btn">Submit Application</button>
      </form>
    `;

    const snapshot = extractPageSnapshot({ root: document.body, registry });

    expect(snapshot.headings).toHaveLength(1);
    expect(snapshot.headings[0].text).toBe("Ministry Pension Portal");
    expect(snapshot.groups).toHaveLength(1);
    expect(snapshot.groups[0].legend).toBe("Section 1: Beneficiary Identity");

    expect(snapshot.fields).toHaveLength(5);

    // Full Name
    const nameField = snapshot.fields.find((f) => f.accessibleName.includes("Full Name"));
    expect(nameField).toBeDefined();
    expect(nameField?.required).toBe(true);
    expect(nameField?.constraints.maxLength).toBe(80);

    // Aadhaar (sensitivity detection)
    const aadhaarField = snapshot.fields.find((f) => f.accessibleName.includes("Aadhaar"));
    expect(aadhaarField).toBeDefined();
    expect(aadhaarField?.sensitivity).toBe("national_id");
    expect(aadhaarField?.constraints.pattern).toBe("[0-9]{12}");

    // Select
    const genderField = snapshot.fields.find((f) => f.accessibleName.includes("Gender"));
    expect(genderField).toBeDefined();
    expect(genderField?.constraints.options).toHaveLength(3);

    // Checkbox
    const consentField = snapshot.fields.find((f) => f.role === "checkbox");
    expect(consentField).toBeDefined();
    expect(consentField?.accessibleName).toContain("declare that the information is true");

    // Task Model
    const taskModel = buildTaskModel(snapshot);
    expect(taskModel.taskKind).toBe("form");
    expect(taskModel.steps).toHaveLength(5);
    expect(taskModel.finalActionRef).toBeTruthy();
  });

  it("extracts tables, columns and rows from Bank Dashboard markup", () => {
    document.body.innerHTML = `
      <h1>Apex Commercial Bank</h1>
      <table id="tx-table">
        <caption>Recent Savings Account Statement</caption>
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Type</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>2026-11-20</td>
            <td>Apollo Pharmacy Medicines</td>
            <td>DEBIT</td>
            <td>₹ 1,420.00</td>
          </tr>
          <tr>
            <td>2026-11-18</td>
            <td>Monthly Pension Credit</td>
            <td>CREDIT</td>
            <td>₹ 32,500.00</td>
          </tr>
        </tbody>
      </table>
    `;

    const snapshot = extractPageSnapshot({ root: document.body, registry });
    expect(snapshot.tables).toHaveLength(1);
    const table = snapshot.tables[0];
    expect(table.caption).toBe("Recent Savings Account Statement");
    expect(table.columns).toHaveLength(4);
    expect(table.rows).toHaveLength(2);
    expect(table.rows[0].cells["col_2"]).toBe("Apollo Pharmacy Medicines");

    const taskModel = buildTaskModel(snapshot);
    expect(taskModel.taskKind).toBe("table");
  });
});
