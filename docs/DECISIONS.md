# Architecture Decision Records (ADR)

## ADR-1: Shadow DOM Overlay Injection over Side Panel
- **Status**: Accepted
- **Context**: Older adults and low-vision users need a calm, full-viewport focused experience ("One thing at a time") rather than a cramped side-docked panel next to an overwhelming screen.
- **Decision**: Inject a Shadow DOM container (`#skin-overlay-root`) with a smooth cross-fade/morph over the host page, while keeping the host page intact underneath.
- **Consequences**: Complete style encapsulation; host page remains functional backend.

## ADR-2: DOM-Derived Semantic Snapshotting
- **Context**: Chrome Extension content scripts cannot read the native browser accessibility tree directly without the `debugger` API (which shows a prominent warning banner).
- **Decision**: Compute roles, accessible names, constraints, and relationships directly from HTML semantics (`<label>`, `aria-*`, `fieldset`, `legend`, `placeholder`).
- **Consequences**: Lightweight, immediate, no intrusive developer banners.

## ADR-3: Dual Spec Generation (Deterministic Fallback + AI Enhancer)
- **Context**: Hackathon demos and offline resilience require 100% uptime without failure due to API limits or rate limits.
- **Decision**: Provide a deterministic rule-based generator that runs in <10ms and produces high-quality step-by-step flows. An AI adapter layer can enrich titles and translations when an API key is provided.
- **Consequences**: The product never fails with a blank screen.

## ADR-4: Conservative Action Bridge Ladder
- **Context**: React, Angular, and modern web frameworks override `input.value` property setters, causing raw `.value = x` assignment to be ignored by framework state.
- **Decision**: Implement the native prototype setter ladder + synthetic `input`/`change` event dispatching, followed by an immediate DOM read-back verification check.
- **Consequences**: Reliable bidirectional sync with modern web apps.
