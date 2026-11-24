// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, fireEvent, cleanup, within } from "@testing-library/react";
import { GovernmentForm } from "../../apps/demo/src/pages/GovernmentForm.js";
import { BankDashboard } from "../../apps/demo/src/pages/BankDashboard.js";
import { OverlayApp } from "../../apps/extension/src/components/OverlayApp.js";
import { ElementRegistry } from "../../packages/shared/src/bridge/registry.js";
import { ActionBridge } from "../../packages/shared/src/bridge/bridge.js";
import { extractPageSnapshot } from "../../packages/shared/src/perception/snapshotter.js";
import { buildTaskModel } from "../../packages/shared/src/perception/taskmodel.js";

describe("End-to-End User Journeys (J1 - J6)", () => {
  let registry: ElementRegistry;
  let bridge: ActionBridge;

  beforeEach(() => {
    registry = new ElementRegistry();
    bridge = new ActionBridge({ registry });
  });

  afterEach(() => {
    cleanup();
  });

  it("Hero Journey J1: Completes Government Pension Form transformation & bidirectional sync", async () => {
    // 1. Render the real React Host Page
    const hostPage = render(<GovernmentForm />);

    // Check host form inputs exist
    const hostNameInput = hostPage.container.querySelector("#field-full-name") as HTMLInputElement;
    const hostAadhaarInput = hostPage.container.querySelector("#field-aadhaar") as HTMLInputElement;

    expect(hostNameInput).toBeDefined();
    expect(hostNameInput.value).toBe("");

    // 2. Activate Skin Perception on the host page
    const snapshot = extractPageSnapshot({ root: hostPage.container, registry });
    const taskModel = buildTaskModel(snapshot);

    expect(snapshot.fields.length).toBeGreaterThan(5);
    expect(taskModel.taskKind).toBe("form");

    // 3. Render Skin Overlay
    const handleExit = vi.fn();
    const overlay = render(
      <OverlayApp
        initialSnapshot={snapshot}
        taskModel={taskModel}
        registry={registry}
        bridge={bridge}
        onExit={handleExit}
      />
    );

    // Verify Step 1 is active (Full Name)
    const step1Input = overlay.container.querySelector("#skin-text-input") as HTMLInputElement;
    expect(step1Input).toBeDefined();

    // User types "Savitri Devi" into Skin interface
    fireEvent.change(step1Input, { target: { value: "Savitri Devi" } });

    // VERIFY BIDIRECTIONAL SYNC: Original host input updated immediately!
    expect(hostNameInput.value).toBe("Savitri Devi");

    // Click Next
    const nextBtn = within(overlay.container).getByRole("button", { name: /Next/i });
    fireEvent.click(nextBtn);

    // Step 2: Aadhaar number
    const step2Input = overlay.container.querySelector("#skin-text-input") as HTMLInputElement;
    expect(step2Input).toBeDefined();
    fireEvent.change(step2Input, { target: { value: "123456789012" } });

    // VERIFY SYNC: Host Aadhaar input updated!
    expect(hostAadhaarInput.value).toBe("123456789012");
  });

  it("Journey J2: Imran Bank Transaction Table transformation", async () => {
    // 1. Render Host Bank Statement Page
    const hostPage = render(<BankDashboard />);

    // 2. Extract perception
    const snapshot = extractPageSnapshot({ root: hostPage.container, registry });
    const taskModel = buildTaskModel(snapshot);

    expect(snapshot.tables).toHaveLength(1);
    expect(taskModel.taskKind).toBe("table");

    // 3. Render Skin Overlay
    const overlay = render(
      <OverlayApp
        initialSnapshot={snapshot}
        taskModel={taskModel}
        registry={registry}
        bridge={bridge}
        onExit={vi.fn()}
      />
    );

    // Verify RecordList is rendered with simplified transaction cards
    expect(within(overlay.container).getByText(/Your Account Transactions/i)).toBeDefined();
    expect(within(overlay.container).getByText(/Apollo Pharmacy/i)).toBeDefined();
    expect(within(overlay.container).getByText(/Central Pension/i)).toBeDefined();

    // Test search filter input
    const searchInput = within(overlay.container).getByPlaceholderText(/Search entries/i);
    fireEvent.change(searchInput, { target: { value: "Apollo" } });

    expect(within(overlay.container).getByText(/Apollo Pharmacy/i)).toBeDefined();
    expect(within(overlay.container).queryByText(/Central Pension/i)).toBeNull();
  });

  it("Journey J5: Exit control preserves entered host page state", async () => {
    const hostPage = render(<GovernmentForm />);
    const hostNameInput = hostPage.container.querySelector("#field-full-name") as HTMLInputElement;

    const snapshot = extractPageSnapshot({ root: hostPage.container, registry });
    const taskModel = buildTaskModel(snapshot);

    let exited = false;
    const overlay = render(
      <OverlayApp
        initialSnapshot={snapshot}
        taskModel={taskModel}
        registry={registry}
        bridge={bridge}
        onExit={() => {
          exited = true;
        }}
      />
    );

    const step1Input = overlay.container.querySelector("#skin-text-input") as HTMLInputElement;
    fireEvent.change(step1Input, { target: { value: "Ramesh Kumar" } });

    // Exit
    const exitBtn = within(overlay.container).getByTitle(/Use original page/i);
    fireEvent.click(exitBtn);

    expect(exited).toBe(true);
    // Value remains preserved on original host page
    expect(hostNameInput.value).toBe("Ramesh Kumar");
  });
});
