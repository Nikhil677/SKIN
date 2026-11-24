// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import { ActionBridge } from "../../packages/shared/src/bridge/bridge.js";
import { ElementRegistry } from "../../packages/shared/src/bridge/registry.js";

describe("Action Bridge & Native Setter Ladder", () => {
  let registry: ElementRegistry;
  let bridge: ActionBridge;

  beforeEach(() => {
    registry = new ElementRegistry();
    bridge = new ActionBridge({ registry });
    document.body.innerHTML = "";
  });

  it("updates text input using native setter and dispatches events", async () => {
    document.body.innerHTML = `
      <div>
        <label for="username">Username</label>
        <input id="username" type="text" value="" />
      </div>
    `;

    const input = document.getElementById("username") as HTMLInputElement;
    let inputEventFired = false;
    let changeEventFired = false;

    input.addEventListener("input", () => {
      inputEventFired = true;
    });
    input.addEventListener("change", () => {
      changeEventFired = true;
    });

    const ref = registry.register(input, "f");

    const result = await bridge.execute({
      schemaVersion: "1.0",
      actionId: "act_001",
      type: "setValue",
      fieldRef: ref,
      value: "Savitri Devi",
      origin: "user_confirmed",
      requiresConfirmation: false,
    });

    expect(result.status).toBe("ok");
    expect(result.strategyUsed).toBe("native_setter");
    expect(input.value).toBe("Savitri Devi");
    expect(inputEventFired).toBe(true);
    expect(changeEventFired).toBe(true);
    expect(result.observed?.value).toBe("Savitri Devi");
  });

  it("handles checkboxes and select elements correctly", async () => {
    document.body.innerHTML = `
      <form>
        <select id="gender">
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <input id="agree" type="checkbox" />
      </form>
    `;

    const select = document.getElementById("gender") as HTMLSelectElement;
    const checkbox = document.getElementById("agree") as HTMLInputElement;

    const selectRef = registry.register(select, "f");
    const checkRef = registry.register(checkbox, "f");

    // Select option
    const selectRes = await bridge.execute({
      schemaVersion: "1.0",
      actionId: "act_sel",
      type: "selectOption",
      fieldRef: selectRef,
      value: "female",
      origin: "user_confirmed",
      requiresConfirmation: false,
    });
    expect(selectRes.status).toBe("ok");
    expect(select.value).toBe("female");

    // Check checkbox
    const checkRes = await bridge.execute({
      schemaVersion: "1.0",
      actionId: "act_chk",
      type: "check",
      fieldRef: checkRef,
      value: true,
      origin: "user_confirmed",
      requiresConfirmation: false,
    });
    expect(checkRes.status).toBe("ok");
    expect(checkbox.checked).toBe(true);
  });

  it("blocks destructive click without user confirmation", async () => {
    document.body.innerHTML = `
      <button id="del-btn">Delete Account</button>
    `;
    const btn = document.getElementById("del-btn") as HTMLButtonElement;
    const ref = registry.register(btn, "a");

    const result = await bridge.execute({
      schemaVersion: "1.0",
      actionId: "act_del",
      type: "click",
      fieldRef: ref,
      origin: "system_readback", // Not user_confirmed
      requiresConfirmation: true,
    });

    expect(result.status).toBe("blocked");
  });
});
