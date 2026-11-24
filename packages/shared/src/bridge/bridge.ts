import { ActionRequest, ActionResult, ActionStatus, StrategyUsed } from "../schemas/action.js";
import { ElementRegistry, defaultElementRegistry } from "./registry.js";

export interface ActionBridgeOptions {
  registry?: ElementRegistry;
  root?: Document | Element;
}

export class ActionBridge {
  private registry: ElementRegistry;
  private root: Document | Element;

  constructor(options: ActionBridgeOptions = {}) {
    this.registry = options.registry || defaultElementRegistry;
    this.root = options.root || (typeof document !== "undefined" ? document : (null as any));
  }

  async execute(request: ActionRequest): Promise<ActionResult> {
    const timestamp = new Date().toISOString();
    const element = this.registry.resolve(request.fieldRef, this.root);

    if (!element) {
      return {
        schemaVersion: "1.0",
        actionId: request.actionId,
        status: "not_found",
        strategyUsed: "none",
        hostMessages: ["Target element could not be located on the host page."],
        timestamp,
      };
    }

    try {
      let strategyUsed: StrategyUsed = "none";
      const tag = element.tagName.toLowerCase();

      switch (request.type) {
        case "setValue": {
          const stringVal = String(request.value ?? "");
          if (tag === "input") {
            const inputEl = element as HTMLInputElement;
            // Strategy 1: Native prototype setter for React/Vue compatibility
            const prototype = Object.getPrototypeOf(inputEl);
            const valueDesc = Object.getOwnPropertyDescriptor(prototype, "value") ||
              Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");

            if (valueDesc && valueDesc.set) {
              valueDesc.set.call(inputEl, stringVal);
              strategyUsed = "native_setter";
            } else {
              inputEl.value = stringVal;
              strategyUsed = "direct_property";
            }

            inputEl.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
            inputEl.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
          } else if (tag === "textarea") {
            const textEl = element as HTMLTextAreaElement;
            const prototype = Object.getPrototypeOf(textEl);
            const valueDesc = Object.getOwnPropertyDescriptor(prototype, "value") ||
              Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value");

            if (valueDesc && valueDesc.set) {
              valueDesc.set.call(textEl, stringVal);
              strategyUsed = "native_setter";
            } else {
              textEl.value = stringVal;
              strategyUsed = "direct_property";
            }

            textEl.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
            textEl.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
          } else if (tag === "select") {
            const selectEl = element as HTMLSelectElement;
            const prototype = Object.getPrototypeOf(selectEl);
            const valueDesc = Object.getOwnPropertyDescriptor(prototype, "value") ||
              Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value");

            if (valueDesc && valueDesc.set) {
              valueDesc.set.call(selectEl, stringVal);
              strategyUsed = "native_setter";
            } else {
              selectEl.value = stringVal;
              strategyUsed = "direct_property";
            }

            selectEl.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
          }
          break;
        }

        case "selectOption": {
          if (tag === "select") {
            const selectEl = element as HTMLSelectElement;
            const targetVal = String(request.value ?? "");
            const prototype = Object.getPrototypeOf(selectEl);
            const valueDesc = Object.getOwnPropertyDescriptor(prototype, "value") ||
              Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value");

            if (valueDesc && valueDesc.set) {
              valueDesc.set.call(selectEl, targetVal);
              strategyUsed = "native_setter";
            } else {
              selectEl.value = targetVal;
              strategyUsed = "direct_property";
            }

            selectEl.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
          }
          break;
        }

        case "check":
        case "uncheck": {
          if (tag === "input") {
            const inputEl = element as HTMLInputElement;
            const desired = request.type === "check";
            if (inputEl.checked !== desired) {
              const prototype = Object.getPrototypeOf(inputEl);
              const checkedDesc = Object.getOwnPropertyDescriptor(prototype, "checked") ||
                Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "checked");

              if (checkedDesc && checkedDesc.set) {
                checkedDesc.set.call(inputEl, desired);
                strategyUsed = "native_setter";
              } else {
                inputEl.checked = desired;
                strategyUsed = "direct_property";
              }

              // Also fire native click to notify React handlers if necessary
              inputEl.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
              inputEl.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
            }
          }
          break;
        }

        case "click": {
          // Safety restriction: Never execute submit without explicit confirmation
          if (request.requiresConfirmation && request.origin !== "user_confirmed") {
            return {
              schemaVersion: "1.0",
              actionId: request.actionId,
              status: "blocked",
              strategyUsed: "none",
              hostMessages: ["Blocked: Irreversible action requires explicit user confirmation."],
              timestamp,
            };
          }

          (element as HTMLElement).click();
          strategyUsed = "click_handler";
          break;
        }

        case "focus": {
          (element as HTMLElement).focus();
          strategyUsed = "click_handler";
          break;
        }

        case "readBack": {
          strategyUsed = "direct_property";
          break;
        }
      }

      // Read-back verification (FR-A3)
      const observed = this.readBackState(element);

      // Check if value matches intent for setValue / selectOption
      let status: ActionStatus = "ok";
      if (request.type === "setValue" || request.type === "selectOption") {
        const expected = String(request.value ?? "");
        if (observed.value !== expected) {
          status = "mismatch";
        }
      } else if (request.type === "check") {
        if (!observed.checked) status = "mismatch";
      } else if (request.type === "uncheck") {
        if (observed.checked) status = "mismatch";
      }

      // Capture any host error messages triggered by the action
      const hostMessages = this.detectHostMessages(element);

      return {
        schemaVersion: "1.0",
        actionId: request.actionId,
        status,
        strategyUsed,
        observed,
        hostMessages,
        timestamp,
      };
    } catch (err: any) {
      return {
        schemaVersion: "1.0",
        actionId: request.actionId,
        status: "error",
        strategyUsed: "none",
        hostMessages: [err?.message || "Unknown error occurred while interacting with DOM."],
        timestamp,
      };
    }
  }

  private readBackState(element: Element): { value?: string; invalid: boolean; checked?: boolean } {
    const inputEl = element as HTMLInputElement;
    const isInvalid =
      element.getAttribute("aria-invalid") === "true" ||
      (element as any).validity?.valid === false ||
      element.classList.contains("border-red-500");

    return {
      value: inputEl.value !== undefined ? inputEl.value : undefined,
      checked: inputEl.type === "checkbox" || inputEl.type === "radio" ? inputEl.checked : undefined,
      invalid: isInvalid,
    };
  }

  private detectHostMessages(element: Element): string[] {
    const messages: string[] = [];
    const parentContainer = element.closest("form, fieldset, div") || element.parentElement;
    if (parentContainer) {
      const errorElements = parentContainer.querySelectorAll("[role='alert'], .text-red-600, .error-message");
      errorElements.forEach((el) => {
        const text = el.textContent?.trim();
        if (text && !messages.includes(text)) {
          messages.push(text);
        }
      });
    }
    return messages;
  }
}
