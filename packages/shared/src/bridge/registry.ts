export interface ElementLocators {
  id?: string;
  name?: string;
  path: string;
  label?: string;
  tagName: string;
  type?: string;
}

export interface RegistryEntry {
  ref: string;
  element: WeakRef<Element>;
  locators: ElementLocators;
  lastKnownValue?: string | boolean;
}

export class ElementRegistry {
  private entries = new Map<string, RegistryEntry>();
  private nextId = 1;

  register(element: Element, prefix = "f"): string {
    const ref = `${prefix}_${String(this.nextId++).padStart(3, "0")}`;
    const locators: ElementLocators = {
      id: element.id || undefined,
      name: element.getAttribute("name") || undefined,
      tagName: element.tagName.toLowerCase(),
      type: element.getAttribute("type") || undefined,
      path: this.computeStructuralPath(element),
    };

    this.entries.set(ref, {
      ref,
      element: new WeakRef(element),
      locators,
    });

    return ref;
  }

  resolve(ref: string, root: Document | Element = document): Element | null {
    const entry = this.entries.get(ref);
    if (!entry) return null;

    const deref = entry.element.deref();
    if (deref && deref.isConnected) {
      return deref;
    }

    // Attempt re-resolution via locators
    const { id, name, path, tagName } = entry.locators;
    if (id) {
      const byId = root.querySelector(`#${CSS.escape(id)}`);
      if (byId) {
        entry.element = new WeakRef(byId);
        return byId;
      }
    }

    if (name) {
      const byName = root.querySelector(`${tagName}[name="${CSS.escape(name)}"]`);
      if (byName) {
        entry.element = new WeakRef(byName);
        return byName;
      }
    }

    try {
      const byPath = root.querySelector(path);
      if (byPath) {
        entry.element = new WeakRef(byPath);
        return byPath;
      }
    } catch {
      // Ignored if invalid selector
    }

    return null;
  }

  clear() {
    this.entries.clear();
    this.nextId = 1;
  }

  private computeStructuralPath(element: Element): string {
    const path: string[] = [];
    let curr: Element | null = element;
    while (curr && curr !== document.body && curr !== document.documentElement) {
      let segment = curr.tagName.toLowerCase();
      if (curr.id) {
        segment += `#${curr.id}`;
        path.unshift(segment);
        break;
      } else {
        const parent: Element | null = curr.parentElement;
        if (parent) {
          const siblings = Array.from(parent.children).filter((c) => c.tagName === curr!.tagName);
          if (siblings.length > 1) {
            const index = siblings.indexOf(curr) + 1;
            segment += `:nth-of-type(${index})`;
          }
        }
        path.unshift(segment);
      }
      curr = curr.parentElement;
    }
    return path.join(" > ");
  }
}

export const defaultElementRegistry = new ElementRegistry();
