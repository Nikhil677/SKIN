# SKIN Architecture

## Overview
SKIN transforms complex, overwhelming web pages into a calm, accessible, step-by-step experience while maintaining the original webpage as the active backend and system of record.

```
+-----------------------------------------------------------------------------------+
| Host Webpage (stays running underneath)                                           |
|   - Form inputs / buttons / tables                                                |
|   - Framework state (React, Vue, etc.)                                            |
|                                                                                   |
|        ^ (DOM events / Native Setters)       | (DOM Extraction / Mutations)       |
|        |                                     v                                    |
| +-------------------------------------------------------------------------------+ |
| | SKIN Injected Content Script (Isolated World)                                 | |
| |                                                                               | |
| |   [DOM Snapshotter]   --->  [Task Model Builder]  --->  [UI Spec Generator]   | |
| |           |                         |                         |               | |
| |           v                         v                         v               | |
| |   [Element Registry]        [Step Flow]             [Deterministic / LLM]     | |
| |           ^                                                   |               | |
| |           |                                                   v               | |
| |   [Action Bridge]   <----   [Confirmed Action]   <----  [Shadow DOM Overlay]  | |
| |   (Native Setter Ladder)                                (React 19 + Tailwind) | |
| |                                                         (One Q at a time,     | |
| |                                                          Voice In/Out)        | |
| +-------------------------------------------------------------------------------+ |
+-----------------------------------------------------------------------------------+
```

## Key Architectural Decisions
1. **Shadow DOM Isolation**: The Skin overlay is rendered inside a dedicated `#skin-overlay-root` with an attached Shadow DOM, ensuring complete CSS and layout isolation from the host page.
2. **Deterministic UI Spec Generator First**: Skin always works immediately without an external API key or network dependency.
3. **Native Setter Ladder in Action Bridge**: Updates to inputs on React/Angular/Vue controlled forms bypass overridden setters using `Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')` and dispatch synthetic bubbling `input` and `change` events followed by host read-back verification.
4. **Security & Privacy by Design**:
   - Zero sensitive values (passwords, OTPs, PINs) are processed.
   - The LLM pipeline only receives structural schema information (labels, field types, counts), never entered user values or bank account numbers.
   - Action bridge enforces strict user confirmation before activating any destructive action or submission.
