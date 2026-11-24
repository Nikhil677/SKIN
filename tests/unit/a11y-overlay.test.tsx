// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { QuestionText } from "../../apps/extension/src/components/QuestionText.js";
import { QuestionChoice } from "../../apps/extension/src/components/QuestionChoice.js";
import { QuestionConsent } from "../../apps/extension/src/components/QuestionConsent.js";
import { ConfirmAction } from "../../apps/extension/src/components/ConfirmAction.js";
import { VoiceEchoModal } from "../../apps/extension/src/components/VoiceEchoModal.js";
import { DEFAULT_PROFILE } from "../../packages/shared/src/schemas/profile.js";

describe("Overlay Accessibility & Interaction", () => {
  afterEach(() => {
    cleanup();
  });
  it("renders QuestionText with labeled input and handles changes", () => {
    const handleChange = vi.fn();
    render(
      <QuestionText
        prompt="What is your full name?"
        hint="As per Aadhaar card"
        value="Savitri"
        profile={DEFAULT_PROFILE}
        onChange={handleChange}
      />
    );

    const input = screen.getByLabelText(/What is your full name?/i);
    expect(input).toBeDefined();
    expect((input as HTMLInputElement).value).toBe("Savitri");

    fireEvent.change(input, { target: { value: "Savitri Devi" } });
    expect(handleChange).toHaveBeenCalledWith("Savitri Devi");
  });

  it("renders QuestionChoice options with radio roles and selects option", () => {
    const handleSelect = vi.fn();
    render(
      <QuestionChoice
        prompt="Select your gender:"
        options={[
          { value: "female", label: "Female" },
          { value: "male", label: "Male" },
        ]}
        value="female"
        profile={DEFAULT_PROFILE}
        onChange={handleSelect}
      />
    );

    const maleRadio = screen.getByRole("radio", { name: /^Male$/i });
    expect(maleRadio).toBeDefined();
    fireEvent.click(maleRadio);
    expect(handleSelect).toHaveBeenCalledWith("male");
  });

  it("renders QuestionConsent with keyboard toggling", () => {
    const handleToggle = vi.fn();
    render(
      <QuestionConsent
        prompt="Declaration & Consent"
        statement="I declare all information is accurate."
        checked={false}
        profile={DEFAULT_PROFILE}
        onChange={handleToggle}
      />
    );

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox.getAttribute("aria-checked")).toBe("false");

    fireEvent.keyDown(checkbox, { key: "Enter" });
    expect(handleToggle).toHaveBeenCalledWith(true);
  });

  it("renders ConfirmAction gate before irreversible action", () => {
    const handleConfirm = vi.fn();
    const handleCancel = vi.fn();
    render(
      <ConfirmAction
        consequence="You are about to submit your application on the official portal."
        confirmLabel="Confirm & Submit"
        cancelLabel="Go Back"
        profile={DEFAULT_PROFILE}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );

    const confirmBtn = screen.getByRole("button", { name: /Confirm & Submit/i });
    fireEvent.click(confirmBtn);
    expect(handleConfirm).toHaveBeenCalled();
  });

  it("renders VoiceEchoModal with voice candidate and triggers confirm", () => {
    const handleConfirm = vi.fn();
    const handleRetry = vi.fn();
    render(
      <VoiceEchoModal
        recognizedText="123456789012"
        profile={DEFAULT_PROFILE}
        onConfirm={handleConfirm}
        onRetry={handleRetry}
      />
    );

    const confirmBtn = screen.getByRole("button", { name: /Yes, continue/i });
    fireEvent.click(confirmBtn);
    expect(handleConfirm).toHaveBeenCalled();
  });
});
