import React from "react";
import ReactDOM from "react-dom/client";
import { OverlayApp } from "../../src/components/OverlayApp";
import { extractPageSnapshot, buildTaskModel, defaultElementRegistry, ActionBridge } from "@skin/shared";
import "./style.css";

export default defineContentScript({
  matches: ["<all_urls>"],
  cssInjectionMode: "ui",

  async main(ctx) {
    let uiInstance: any = null;
    let isMounted = false;

    const toggleOverlay = async () => {
      if (isMounted && uiInstance) {
        uiInstance.remove();
        isMounted = false;
        uiInstance = null;
        return;
      }

      // 1. Extract Snapshot from Host DOM
      const snapshot = extractPageSnapshot({
        root: document.body,
        registry: defaultElementRegistry,
      });

      // 2. Build Task Model
      const taskModel = buildTaskModel(snapshot);
      const bridge = new ActionBridge({ registry: defaultElementRegistry, root: document });

      // 3. Mount UI inside Shadow DOM
      uiInstance = await createShadowRootUi(ctx, {
        name: "skin-overlay-root",
        position: "overlay",
        anchor: "body",
        onMount: (container) => {
          const root = ReactDOM.createRoot(container);
          root.render(
            <React.StrictMode>
              <OverlayApp
                initialSnapshot={snapshot}
                taskModel={taskModel}
                registry={defaultElementRegistry}
                bridge={bridge}
                onExit={() => {
                  if (uiInstance) {
                    uiInstance.remove();
                    isMounted = false;
                    uiInstance = null;
                  }
                }}
              />
            </React.StrictMode>
          );
          return root;
        },
        onRemove: (root) => {
          root?.unmount();
        },
      });

      uiInstance.mount();
      isMounted = true;
    };

    // Listen for extension icon click message
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === "TOGGLE_SKIN") {
        toggleOverlay();
        sendResponse({ success: true });
      }
      return true;
    });

    // Also mount a discreet floating "Activate Skin" trigger on demo pages for instant convenience
    const addFloatingPill = () => {
      if (document.getElementById("skin-floating-trigger")) return;
      const pill = document.createElement("button");
      pill.id = "skin-floating-trigger";
      pill.innerHTML = `
        <span style="font-weight: 900; background: #2563eb; color: white; border-radius: 9999px; width: 22px; height: 22px; display: inline-flex; align-items: center; justify-content: center; font-size: 11px;">S</span>
        <span>Activate SKIN</span>
      `;
      pill.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 999999;
        display: flex;
        align-items: center;
        gap: 8px;
        background: #0f172a;
        color: #f8fafc;
        border: 2px solid #3b82f6;
        border-radius: 9999px;
        padding: 10px 18px;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
        transition: transform 0.15s ease, background 0.15s ease;
      `;
      pill.onmouseenter = () => {
        pill.style.transform = "scale(1.05)";
        pill.style.background = "#1e293b";
      };
      pill.onmouseleave = () => {
        pill.style.transform = "scale(1)";
        pill.style.background = "#0f172a";
      };
      pill.onclick = () => {
        toggleOverlay();
      };
      document.body.appendChild(pill);
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", addFloatingPill);
    } else {
      addFloatingPill();
    }
  },
});
