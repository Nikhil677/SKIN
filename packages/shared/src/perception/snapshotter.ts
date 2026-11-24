import {
  PageSnapshot,
  FieldSnapshot,
  GroupSchema,
  TableSnapshot,
  ActionSnapshot,
  NameSourceSchema,
  NameConfidenceSchema,
} from "../schemas/snapshot.js";
import { classifySensitivity } from "./sensitivity.js";
import { ElementRegistry, defaultElementRegistry } from "../bridge/registry.js";
import { z } from "zod";

export interface SnapshotOptions {
  root?: Element | Document;
  registry?: ElementRegistry;
}

export function extractPageSnapshot(options: SnapshotOptions = {}): PageSnapshot {
  const root = options.root || (typeof document !== "undefined" ? document : null);
  if (!root) {
    throw new Error("No DOM document or root element available for snapshotting.");
  }

  const registry = options.registry || defaultElementRegistry;
  registry.clear();

  const title = (typeof document !== "undefined" && document.title) || "Portal Application";
  const origin = (typeof window !== "undefined" && window.location?.origin) || "http://localhost";
  const lang = (typeof document !== "undefined" && document.documentElement?.lang) || "en";

  // 1. Headings
  const headings: { level: number; text: string }[] = [];
  root.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((el) => {
    const text = el.textContent?.trim();
    if (text && text.length > 0) {
      const level = parseInt(el.tagName[1], 10);
      headings.push({ level, text: text.slice(0, 300) });
    }
  });

  // 2. Groups (fieldsets / sections)
  const groupMap = new Map<Element, string>();
  const groups: z.infer<typeof GroupSchema>[] = [];
  root.querySelectorAll("fieldset, section").forEach((grpEl) => {
    const legendEl = grpEl.querySelector("legend, h2, h3, h4");
    const legend = legendEl?.textContent?.trim() || "";
    const ref = registry.register(grpEl, "g");
    groupMap.set(grpEl, ref);
    groups.push({
      ref,
      kind: grpEl.tagName.toLowerCase() === "fieldset" ? "fieldset" : "section",
      legend,
      fieldRefs: [],
    });
  });

  // 3. Fields
  const fields: FieldSnapshot[] = [];
  let unlabeledCount = 0;

  const controlElements = root.querySelectorAll(
    "input:not([type='hidden']):not([type='submit']):not([type='button']):not([type='reset']), select, textarea"
  );

  controlElements.forEach((el) => {
    // Check visibility if element has style
    const htmlEl = el as HTMLElement;
    if (htmlEl.style?.display === "none" || htmlEl.style?.visibility === "hidden") {
      return;
    }

    const ref = registry.register(el, "f");
    const tag = el.tagName.toLowerCase();
    const type = (el.getAttribute("type") || (tag === "select" ? "select" : tag === "textarea" ? "textarea" : "text")).toLowerCase();

    // Determine parent group
    const parentGroupEl = el.closest("fieldset, section");
    const groupRef = parentGroupEl ? groupMap.get(parentGroupEl) || null : null;
    if (groupRef) {
      const g = groups.find((grp) => grp.ref === groupRef);
      if (g) g.fieldRefs.push(ref);
    }

    // Accessible Name Computation
    let accessibleName = "";
    let nameSource: z.infer<typeof NameSourceSchema> = "none";
    let nameConfidence: z.infer<typeof NameConfidenceSchema> = "low";

    // 1. aria-labelledby
    const ariaLabelledBy = el.getAttribute("aria-labelledby");
    if (ariaLabelledBy) {
      const ids = ariaLabelledBy.split(/\s+/);
      const parts = ids
        .map((id) => root.querySelector(`#${CSS.escape(id)}`)?.textContent?.trim())
        .filter(Boolean);
      if (parts.length > 0) {
        accessibleName = parts.join(" ");
        nameSource = "aria-labelledby";
        nameConfidence = "high";
      }
    }

    // 2. aria-label
    if (!accessibleName && el.getAttribute("aria-label")) {
      accessibleName = el.getAttribute("aria-label")!.trim();
      nameSource = "aria-label";
      nameConfidence = "high";
    }

    // 3. Associated <label for="id">
    if (!accessibleName && el.id) {
      const label = root.querySelector(`label[for="${CSS.escape(el.id)}"]`);
      if (label) {
        accessibleName = label.textContent?.trim().replace(/\s*\*\s*$/, "") || "";
        nameSource = "label";
        nameConfidence = "high";
      }
    }

    // 4. Enclosing <label>
    if (!accessibleName) {
      const parentLabel = el.closest("label");
      if (parentLabel) {
        const textNodes: string[] = [];
        parentLabel.childNodes.forEach((node) => {
          if (node.nodeType === 3 && node.textContent?.trim()) {
            textNodes.push(node.textContent.trim());
          }
        });
        if (textNodes.length > 0) {
          accessibleName = textNodes.join(" ").replace(/\s*\*\s*$/, "");
          nameSource = "label";
          nameConfidence = "high";
        }
      }
    }

    // 5. Placeholder
    if (!accessibleName && el.getAttribute("placeholder")) {
      accessibleName = el.getAttribute("placeholder")!.trim();
      nameSource = "placeholder";
      nameConfidence = "medium";
    }

    // 6. Title
    if (!accessibleName && el.getAttribute("title")) {
      accessibleName = el.getAttribute("title")!.trim();
      nameSource = "title";
      nameConfidence = "medium";
    }

    // 7. Fallback: Preceding sibling / text
    if (!accessibleName) {
      const prev = el.previousElementSibling;
      if (prev && (prev.tagName === "SPAN" || prev.tagName === "DIV" || prev.tagName === "P")) {
        const txt = prev.textContent?.trim();
        if (txt && txt.length < 80) {
          accessibleName = txt;
          nameSource = "nearby-text";
          nameConfidence = "low";
        }
      }
    }

    if (!accessibleName) {
      unlabeledCount++;
      accessibleName = el.getAttribute("name") || `Field ${fields.length + 1}`;
    }

    // Description (aria-describedby)
    let description = "";
    const ariaDescribedBy = el.getAttribute("aria-describedby");
    if (ariaDescribedBy) {
      const descEl = root.querySelector(`#${CSS.escape(ariaDescribedBy)}`);
      description = descEl?.textContent?.trim() || "";
    }

    // Constraints
    const required = el.hasAttribute("required") || el.getAttribute("aria-required") === "true";
    const pattern = el.getAttribute("pattern");
    const minLength = el.getAttribute("minlength") ? parseInt(el.getAttribute("minlength")!, 10) : null;
    const maxLength = el.getAttribute("maxlength") ? parseInt(el.getAttribute("maxlength")!, 10) : null;

    let options: { value: string; label: string }[] | null = null;
    if (tag === "select") {
      const optElements = (el as HTMLSelectElement).querySelectorAll("option");
      options = Array.from(optElements).map((opt) => ({
        value: opt.value,
        label: opt.textContent?.trim() || opt.value,
      }));
    }

    const state = {
      disabled: (el as HTMLInputElement).disabled || el.hasAttribute("disabled"),
      readOnly: (el as HTMLInputElement).readOnly || el.hasAttribute("readonly"),
      invalid: el.getAttribute("aria-invalid") === "true" || el.classList.contains("invalid") || el.classList.contains("border-red-500"),
      checked: (el as HTMLInputElement).checked,
      currentValue: (el as HTMLInputElement).value || "",
    };

    const sensitivity = classifySensitivity(el, accessibleName, type);

    fields.push({
      ref,
      tag,
      type,
      role: type === "checkbox" ? "checkbox" : type === "radio" ? "radio" : "textbox",
      accessibleName,
      nameSource,
      nameConfidence,
      description,
      required,
      constraints: {
        pattern,
        minLength,
        maxLength,
        options,
      },
      state,
      sensitivity,
      groupRef,
      visible: true,
    });
  });

  // 4. Tables
  const tables: TableSnapshot[] = [];
  root.querySelectorAll("table").forEach((tbl) => {
    const caption = tbl.querySelector("caption")?.textContent?.trim() || "";
    const columns: { ref: string; label: string; key?: string }[] = [];
    tbl.querySelectorAll("thead th").forEach((th, idx) => {
      columns.push({
        ref: `col_${idx + 1}`,
        label: th.textContent?.trim() || `Col ${idx + 1}`,
      });
    });

    const rows: { ref: string; cells: Record<string, string> }[] = [];
    tbl.querySelectorAll("tbody tr").forEach((tr, rIdx) => {
      const cells: Record<string, string> = {};
      tr.querySelectorAll("td").forEach((td, cIdx) => {
        const colRef = columns[cIdx]?.ref || `col_${cIdx + 1}`;
        cells[colRef] = td.textContent?.trim().replace(/\s+/g, " ") || "";
      });
      if (Object.keys(cells).length > 0) {
        rows.push({
          ref: `row_${rIdx + 1}`,
          cells,
        });
      }
    });

    if (columns.length > 0 && rows.length > 0) {
      tables.push({
        ref: registry.register(tbl, "t"),
        caption,
        columns,
        rows,
      });
    }
  });

  // 5. Actions (submit buttons, key actions)
  const actions: ActionSnapshot[] = [];
  root.querySelectorAll("button, input[type='submit']").forEach((btn) => {
    const text = btn.textContent?.trim() || (btn as HTMLInputElement).value || "Action";
    const isSubmit =
      btn.getAttribute("type") === "submit" ||
      btn.id.toLowerCase().includes("submit") ||
      text.toLowerCase().includes("submit");
    const destructive = text.toLowerCase().includes("delete") || text.toLowerCase().includes("remove")
      ? "destructive"
      : "safe";

    actions.push({
      ref: registry.register(btn, "a"),
      kind: isSubmit ? "submit" : "button",
      accessibleName: text,
      destructive,
    });
  });

  return {
    schemaVersion: "1.0",
    snapshotId: `snap_${Date.now()}`,
    capturedAt: new Date().toISOString(),
    origin,
    title,
    lang,
    headings,
    groups,
    fields,
    tables,
    messages: [],
    actions,
    diagnostics: {
      unlabeledFields: unlabeledCount,
      truncated: false,
    },
  };
}
