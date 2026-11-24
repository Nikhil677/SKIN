# SKIN — Project Master Document

*Re-render any site as an interface built for you.*

Version 1.0 · Type: product and technical specification · Status: pre-implementation. No build exists and no test results are claimed anywhere in this document.

## 0. Document Control and How to Use This Document

### 0.1 Purpose

This is the single source of truth for SKIN. It is written for four consumers: software-development AIs, UI/UX design AIs, technical-documentation AIs and presentation-generation AIs. Where another artifact disagrees with this document, this document wins. Where it is silent, nothing may be invented; log an open question (see §22).

### 0.2 Reading map

| Consumer | Primary sections |
| --- | --- |
| Software development AI | §6, §9–§16, §18–§20 |
| UI/UX design AI | §4, §5, §8, §17 |
| Technical documentation AI | All sections; §13 and §22 for references and registers |
| Presentation AI | §1–§3, §5, §20, §21 |

### 0.3 Evidence labels

Every non-obvious statement carries one label so that facts, opinions and plans are never mixed.

- **\[SRC\]** Stated in the original solution brief.
- **\[FACT\]** Documented platform or standards behavior, written from the author's knowledge and not re-verified live. Anything volatile is flagged "verify at build" and resolved in the Phase 0 spikes (§14).
- **\[REC\]** A recommendation made by this document.
- **\[ASSUMP\]** An assumption that must be validated before it is relied on.
- **\[MVP\]** In scope for the hackathon MVP.
- **\[FUTURE\]** Not in MVP; a possibility only.

### 0.4 Honesty rules for all downstream AIs

1. Do not claim SKIN works on arbitrary sites. The MVP targets two controlled demo sites (§20).
2. Do not state performance, accuracy, user-satisfaction or accessibility-outcome numbers. Every number here is a target or budget, not a measurement.
3. Do not present speech recognition as private or offline unless the specific on-device path has been verified (§16).
4. Do not describe the LLM as producing HTML, scripts or DOM operations. It produces schema-validated JSON only.
5. Do not generate slides or copy that imply real government or bank integration. The demo sites are self-built mocks with synthetic data.

Terminology: **Skin** is the product; the **host page** is the original website; the **overlay** is Skin's generated interface; the **action bridge** is the component that replays interactions onto the host page.

## 1. Executive Summary

SKIN is a Chrome extension that takes any supported web page and re-renders it as a generated interface fitted to the person using it: large type, one question at a time, plain language, in their own language, with voice in and out. Every control in the generated interface is wired back to the real page, which stays loaded and acts as the backend. \[SRC\]

**Problem.** Dense government and banking portals defeat older adults, low-vision users and second-language readers, and broken markup defeats screen readers. \[SRC\]

**Approach.** SKIN reads the page, infers its task structure (steps, required fields, errors), asks an LLM to emit a JSON UI specification limited to a fixed component library, renders that specification in a controlled overlay, and maps each answer back to DOM actions on the host page. \[SRC\]

**What is new.** Reader modes strip pages and overlay tools patch them. SKIN regenerates the interaction model while keeping the original site as the system of record. \[SRC\]

**What the MVP proves.** That a fixed component library plus a task model can turn one government-style form and one bank-style table into a guided, voice-capable experience whose actions land correctly on the underlying page. \[MVP\]

**What the MVP does not prove.** Compatibility with arbitrary sites, with complex single-page apps, with authenticated real banking flows, or with any measured improvement in user outcomes. These are explicitly deferred (§18, §20).

## 2. Problem, Opportunity and Novelty

### 2.1 Who is affected

- Older adults who find dense, jargon-heavy, small-type forms exhausting and error-prone. \[SRC\]
- Low-vision users who rely on zoom and contrast and for whom reflow often breaks. \[SRC\]
- Second-language readers facing portals written in a language they read slowly. \[SRC\]
- Screen-reader users blocked by missing labels, unlabeled controls and broken landmarks. \[SRC\]

### 2.2 Why existing approaches fall short

| Approach | What it does | Limitation | SKIN difference |
| --- | --- | --- | --- |
| Reader mode | Strips page to article text | Removes forms and interaction; unsuited to transactional pages | Keeps and drives the interactive form |
| Accessibility overlays and widgets | Patch the existing page (contrast, font size, ARIA fixes) | Cannot change the interaction model; cannot reduce cognitive load; quality of patches is limited by the page's structure | Replaces the interaction model entirely |
| Browser zoom and OS magnifiers | Enlarge the page | Page remains dense; horizontal scrolling; no guidance | One question per screen at any size |
| Page translation | Translates text in place | Layout and jargon unchanged; form errors may remain in the source language | Plain-language rewrite plus translation, with the original one tap away |
| Human helpers | Fill forms for the person | Not always available; privacy and dependency concerns | Self-service, with the person in control |

### 2.3 Positioning statement \[REC\]

For people who struggle with dense web portals, SKIN is a browser extension that turns any supported page into a guided, one-question-at-a-time interface in their language, unlike reader modes or overlays, because it regenerates the interaction while the original site remains the backend.

## 3. Vision, Principles and Non-Goals

### 3.1 Vision

Every person should be able to complete an essential online task in the form that fits their eyes, language and pace, without waiting for each institution to rebuild its site.

### 3.2 Design principles \[REC\]

1. **The person is in control.** Nothing irreversible happens without explicit confirmation; "Show original page" is always available.
2. **The original site is the source of truth.** Skin never stores or invents form state that is not reflected on the host page.
3. **Structure from the page, language from the model.** Deterministic extraction first; the LLM rewrites and organizes but never invents controls.
4. **Never raw HTML.** The LLM emits data for a closed component set.
5. **Fail visibly and gracefully.** If Skin cannot understand a page or an action fails, it says so in plain language and hands the person back to the original page.
6. **Sensitive values stay local by default.** Values the person speaks or types are not sent to the LLM (§16).
7. **Calm by default.** One thing at a time, no timers, no pressure.

### 3.3 Non-goals

- Not a general browser agent that completes tasks autonomously on the person's behalf.
- Not a replacement for institutions fixing their own accessibility; it is a bridge.
- Not a password manager, identity wallet or document-storage tool.
- Not an automatic CAPTCHA, OTP or login solver.
- Not a guarantee of correct translation of legal or financial terms; Skin shows originals on request.

## 4. Personas

Personas are illustrative archetypes derived from the source brief, not from primary research. \[ASSUMP\] They must be validated with real users before being treated as findings.

### P1 — Savitri, 70, pension applicant (primary)

- Context: Retired schoolteacher; reads Hindi comfortably, English slowly; uses a smartphone for calls and messaging; has a laptop at a relative's home. \[SRC journey\]
- Goal: Update her details on a pension portal without asking her grandson.
- Barriers: Small type; multi-column layout; unfamiliar terms; fear of making an irreversible mistake.
- Needs: Large Hindi text, one question at a time, read-aloud, voice answers, clear "you can go back" cues, a final review before anything is submitted.

### P2 — Imran, 58, low-vision bank customer

- Context: Uses 300% zoom and high-contrast settings; occasionally a screen reader; checks statements and downloads transaction history.
- Barriers: Wide transaction tables break at high zoom; focus order is erratic.
- Needs: A simplified list of transactions, large type, consistent navigation, ability to ask for the largest or latest item.

### P3 — Ramesh, 34, second-language reader

- Context: Migrant worker comfortable in Hindi or Tamil, limited English; needs to complete government forms written in English.
- Barriers: Jargon, abbreviations, ambiguous error messages.
- Needs: Plain-language rewrite, his language, a glossary on tap, confidence that what he enters lands in the right field.

### P4 — Anita, 45, screen-reader user

- Context: Uses NVDA or TalkBack; sites with unlabeled fields or inaccessible custom widgets block her.
- Needs: An overlay that is itself fully accessible (landmarks, focus management, live regions) and that reliably labels controls the host page left unlabeled.

### Secondary stakeholders

- **Family caregiver:** may set up the language, text size and voice profile once. \[FUTURE for remote setup; MVP is local setup\]
- **Institution accessibility lead:** \[FUTURE\] the buyer of accessibility-as-a-service.

## 5. User Journeys

### J1 — Pension portal form (hero journey) \[SRC, MVP\]

Savitri opens the pension portal and clicks the Skin icon.

| Step | Person sees or does | Skin and host page do |
| --- | --- | --- |
| 1 | Clicks Skin icon; first run asks language (Hindi), text size, voice on | Stores profile locally; injects overlay on this tab |
| 2 | Sees the dense form shrink and fade as the overlay morphs in | Extracts snapshot; builds task model; generates UI spec |
| 3 | Sees "चरण 2 / 5: आपका आधार नंबर" (Step 2 of 5: your Aadhaar number) with a large input | Reads the prompt aloud; the matching host field is located and referenced |
| 4 | Says the 12 digits; sees them echoed in large type | Speech recognition returns text; Skin validates length locally; echoes for confirmation |
| 5 | Says "हाँ" (yes) or taps Next | Action bridge writes the value to the real field and verifies the field state |
| 6 | Continues through remaining steps | Same loop per step; errors from the host page are relayed in plain Hindi |
| 7 | Review screen lists all answers in her language | Skin reads values back from the host page DOM, not from its own memory |
| 8 | Taps "Submit on the pension site" after a confirmation prompt | The only irreversible action; requires an explicit confirm; the host page's own submit control is activated |

### J2 — Bank statement table \[MVP\]

Imran opens a statement page, activates Skin, and sees a short list of recent transactions as large cards (date, description, amount, direction). He says "largest debit" and Skin highlights and reads it. Skin does not move money in the MVP; this journey is read-only.

### J3 — Error recovery \[MVP\]

The host page rejects an entry (inline error or banner). Skin detects the error element or `aria-invalid`/live-region message, rewrites it in plain language in the person's language, returns to the relevant question, and keeps the original message accessible via "Show original text".

### J4 — First-run setup \[MVP\]

Language, text size (three presets), contrast (two presets), voice output on/off, voice input on/off with a plain statement of where audio goes (§16).

### J5 — Exit to the original page \[MVP\]

At any time the person chooses "Use original page". The overlay closes, host-page state is preserved as it stands, and focus returns to the last meaningful control.

### J6 — Unsupported page \[MVP\]

Skin cannot confidently identify a task. It says so in one sentence, and offers either the original page or a limited mode (larger type and read-aloud on the host page). \[REC\]

## 6. Product Requirements

### 6.1 Functional requirements

Priority: **M** = MVP, **P** = post-MVP, **F** = future.

**Capture**

- FR-C1 (M): Activate on explicit user gesture on the current tab.
- FR-C2 (M): Produce a page snapshot of interactive controls, labels, groups, headings, tables and visible messages (§9, §12).
- FR-C3 (M): Observe host-page mutations while Skin is active and refresh the snapshot incrementally.
- FR-C4 (P): Best-effort support for same-origin iframes and open shadow roots; cross-origin iframes via per-frame injection.

**Understanding**

- FR-U1 (M): Deterministic extraction of fields, labels, groups, required state and constraints (pattern, maxlength, type, options).
- FR-U2 (M): Group fields into steps; one primary question per step.
- FR-U3 (M): Detect validation errors and status messages on the host page.
- FR-U4 (M): Classify sensitive fields (password, OTP, national ID, payment card) and apply the handling rules in §16.
- FR-U5 (M): LLM-assisted plain-language rewriting, step titles and translation.
- FR-U6 (P): Task inference for multi-page wizards, with step transitions across navigations.

**Generation**

- FR-G1 (M): The LLM returns a UI spec that validates against the published JSON schema; invalid output is rejected.
- FR-G2 (M): Only components in the fixed library may appear (§8.8).
- FR-G3 (M): A deterministic fallback spec generator works without the LLM.
- FR-G4 (M): No raw HTML, script, URL, style or event handler is accepted from the LLM.

**Rendering**

- FR-R1 (M): One primary question or one primary record view per screen.
- FR-R2 (M): Persistent progress indicator ("Step n of N") and Back control.
- FR-R3 (M): Large type, high contrast, large touch targets (§8, §17).
- FR-R4 (M): Morph transition from host page to overlay, with a reduced-motion alternative.
- FR-R5 (M): "Show original" and "Use original page" controls always reachable.

**Interaction**

- FR-I1 (M): Read-aloud of prompts, options and errors using speech synthesis.
- FR-I2 (M): Voice input for answers, with always-available typed and tapped alternatives.
- FR-I3 (M): Full keyboard operability and screen-reader compatibility of the overlay.
- FR-I4 (M): Echo-and-confirm for voice-entered values, especially digits, dates and names.

**Action**

- FR-A1 (M): Map each answer to one or more DOM actions through element references.
- FR-A2 (M): React-safe and framework-safe value setting (§9.6).
- FR-A3 (M): After every action, read back host-page state and confirm it matches intent; otherwise surface a failure.
- FR-A4 (M): Gate irreversible actions behind an explicit confirm step.
- FR-A5 (M): Hand off password, OTP and CAPTCHA to the person on the original page.
- FR-A6 (M): Relay host-page errors back into the overlay.

**Personalization and control**

- FR-P1 (M): Local profile: language, text size, contrast, voice output, voice input, speech rate.
- FR-P2 (F): Per-person UI profiles that persist across sites and devices.
- FR-S1 (M): The person can exit at any time without losing host-page state.
- FR-S2 (P): Plain-language activity log ("What Skin did on this page").

### 6.2 Non-functional requirements

Budgets are targets, not measurements. \[ASSUMP\]

- NFR-1 Responsiveness: with the deterministic path, first Skin screen target under 1 second after activation on the demo sites; with the LLM path, target under 5 seconds with a visible progress state.
- NFR-2 Resilience: any LLM, network or extraction failure must fall back to the deterministic spec or to the original page; never a blank screen.
- NFR-3 Privacy: see §16; no page content or answers leave the device except as the explicit, user-informed paths there define.
- NFR-4 Accessibility: the overlay meets WCAG 2.2 Level AA as a design target (§17).
- NFR-5 Compatibility: latest stable Chrome on desktop for MVP; other Chromium browsers and mobile are future.
- NFR-6 Maintainability: the component library, schemas and prompts are versioned; every UI spec carries a schema version.
- NFR-7 Observability: local-only debug logs by default; no remote analytics in MVP.

## 7. Feature Breakdown by Tier

| Feature | MVP | Post-MVP | Future |
| --- | --- | --- | --- |
| Extension activation via toolbar click | ✔ |  |  |
| Deterministic form extraction and step grouping | ✔ |  |  |
| LLM plain-language rewrite and translation (Hindi plus English) | ✔ | More languages | Regional dialect tuning |
| Fixed component library, schema-validated | ✔ | Library growth | Institution-specific themes |
| Voice output (speech synthesis) | ✔ |  |  |
| Voice input (speech recognition) | ✔ | On-device path if verified | Wake-free hands-free flow |
| Government-style form demo (mock) | ✔ |  |  |
| Bank-style table demo (mock, read-only) | ✔ |  |  |
| Action bridge with React-safe setters | ✔ | Trusted-input path via debugger |  |
| Review screen and irreversible-action gate | ✔ |  |  |
| Local profile | ✔ | Import/export | Per-person profiles synced across devices |
| Multi-page wizard support |  | ✔ |  |
| iframe and open shadow DOM support |  | ✔ |  |
| Activity log |  | ✔ |  |
| Institution-supplied hints (task maps) |  |  | ✔ |
| Accessibility-as-a-service dashboard |  |  | ✔ |

## 8. UX Specification

### 8.1 Interaction model

SKIN replaces the page with a linear, guided flow of screens. Each screen contains: a progress header, one primary content component, and a persistent action bar. Screens are produced from the UI spec (§12.3), never hand-authored per site.

### 8.2 Screen anatomy \[REC\]

1. **Progress header:** "Step 2 of 5" plus a segmented bar; the heading text is also exposed to assistive technology.
2. **Primary content:** the question or record view, with an optional one- or two-sentence plain-language hint.
3. **Action bar:** Back, Next, Read aloud, Speak, Show original text, Use original page.
4. **Status region:** a polite live region for errors and confirmations.

### 8.3 Typography and layout \[REC\]

- Base text: three presets (Large, Larger, Largest), starting at roughly 24 px for body and 32 px or more for the primary question. These are starting values to tune in testing. \[ASSUMP\]
- Line length capped for readability; generous line height; no justified text.
- Devanagari and other non-Latin scripts: bundle an appropriate font (for example, a Noto Sans family variant) so rendering does not depend on host-page fonts. Set the correct `lang` on each text node.
- Primary controls at least 48 px high with ample spacing; this exceeds the WCAG 2.2 minimum target size (24 px) used as a floor. \[FACT: WCAG 2.5.8, verify at build\]

### 8.4 Color and contrast \[REC\]

- Two presets: Standard and High contrast. Both target at least 4.5:1 for body text and 3:1 for large text and UI components (WCAG 2.2 AA). \[FACT\]
- Meaning is never conveyed by color alone.
- Focus indicators are thick, high-contrast and never removed.

### 8.5 The morph transition (wow moment) \[SRC, MVP\]

The host page appears to collapse into a single clear question.

- Mechanism \[REC\]: snapshot the host page's visible layout, animate its blocks fading and shrinking toward the center, and cross-fade into the overlay's first screen. The host page remains loaded underneath.
- Duration target: well under one second; no flashing.
- Reduced motion: if `prefers-reduced-motion` is set, replace the morph with an instant cross-fade. \[FACT: media feature exists\]
- Honesty: the morph is a presentation effect; it does not imply the underlying page was rewritten.

### 8.6 Voice UX \[REC\]

- Each screen can be read aloud automatically (profile setting) or on demand.
- Voice answers are echoed visually in large type and aloud, followed by "Is this correct?"
- Digit sequences are read in groups (for example, groups of four for a 12-digit number) to aid verification.
- Recognition failures produce a short, kind prompt and a prominent typed alternative; never loop more than three times without offering to type.
- Speech voice availability for a given language varies by device and operating system; if no voice exists for the chosen language, Skin says so and falls back to text only. \[ASSUMP, verify at build\]

### 8.7 Language and copy rules \[REC\]

- Plain language: short sentences, everyday words, one instruction per sentence, active voice.
- Never invent facts: a rewrite may simplify a label or hint but must not add legal claims, deadlines or eligibility statements not present on the host page.
- Specialized terms (for example, "nominee", "IFSC") are kept, explained briefly, and linked to a glossary tap.
- "Show original text" reveals the host page's exact wording beside the rewrite.
- Machine translation of legal and financial content may be wrong; a persistent, small notice says so in the person's language.

### 8.8 Component library (closed set)

All content components are rendered by Skin's own code. The LLM selects among them by name.

1. **QuestionText:** free text, number, tel, email (never password).
2. **QuestionDate:** day, month, year inputs or a native date control bound to one or more host fields.
3. **QuestionChoice:** single choice (radio or select); up to about seven options shown as large buttons, more as a searchable list.
4. **QuestionMulti:** multiple checkboxes.
5. **QuestionConsent:** a single acknowledgement or terms checkbox, with the full original text one tap away.
6. **InfoBlock:** non-input explanation or instruction.
7. **RecordList:** simplified rows of a table as cards with a fixed set of labeled fields.
8. **RecordDetail:** one record expanded.
9. **ReviewSummary:** all answers read back from host-page state with an "Edit" link per item.
10. **ConfirmAction:** the irreversible-action gate.
11. **ErrorNotice:** plain-language relay of a host-page error with a path back to the field.
12. **HandoffNotice:** instructs the person to complete a password, OTP or CAPTCHA step on the original page.

Shell components (always rendered by Skin, never chosen by the LLM): ProgressHeader, ActionBar, StatusRegion, LanguageAndSizeControls, ShowOriginalToggle.

### 8.9 Error and empty states

- Extraction failed: "I could not understand this page well enough. You can use the original page." Offer limited mode.
- Speech unavailable or permission denied: text and tap only, with an explanation.
- Action failed verification: "I tried to enter this but the page did not accept it. Let us look at the original page together." Switch to a highlighted view of the host control.
- Session lost (page navigated or reloaded): re-activate prompt; no silent loss of state.

## 9. Technical Architecture

### 9.1 Overview

SKIN is a Manifest V3 Chrome extension. A content script runs in the host page's tab, extracts a structured snapshot, hosts the overlay in a shadow root and executes actions on the host page. A service worker orchestrates messaging and calls a thin LLM gateway. The LLM returns a JSON UI spec that Skin validates and renders from a fixed component library. \[SRC, REC\]

```
Person (voice / touch / keyboard)
   |
[ Tab: host page origin ]
   Host page DOM (unchanged, stays loaded underneath)
      ^ actions                     | snapshot, mutations
   Action Bridge  <------------  Snapshotter + Mutation Observer     } content script
      ^                                  |                              } (isolated world)
   Overlay host (shadow root): renderer, speech, profile, local validation
      |  runtime messaging
[ Service worker ]  ---- HTTPS ---->  [ LLM gateway ]  ---->  LLM API
      |
   chrome.storage (profile)   optional: offscreen doc (speech)   optional: debugger (CDP)
```

### 9.2 Key architecture decisions

| ID | Decision | Rationale | Label |
| --- | --- | --- | --- |
| AD-1 | Overlay is injected into the host tab in a shadow-root container, not a side panel | The morph effect and full-viewport takeover need in-page rendering; shadow root isolates styles from host CSS. A side panel remains a fallback for sites hostile to injection | REC |
| AD-2 | Default perception is a DOM-derived accessibility snapshot; the true browser accessibility tree via CDP is optional enrichment | A content script cannot read the browser's internal accessibility tree directly; CDP access needs the debugger permission and shows a browser banner (§9.3) | REC |
| AD-3 | The LLM never receives values the person enters or values already in host fields | Minimizes exposure of identifiers and financial data (§16) | REC |
| AD-4 | The extension calls an LLM gateway you control, never the LLM vendor directly with an embedded key | Keys shipped in an extension can be extracted | REC |
| AD-5 | A deterministic spec generator exists beside the LLM path | Demo reliability, offline resilience, testability | REC, MVP |
| AD-6 | Host controls are addressed by Skin-assigned element references held in a registry, with multiple locator fallbacks | Survives re-renders better than raw selectors | REC |
| AD-7 | Activation is on user gesture via `activeTab` plus `chrome.scripting`, not blanket host permissions | Smaller permission footprint and a clearer privacy story | REC |

### 9.3 The accessibility tree: what is and is not available

- **\[FACT\]** The browser computes an internal accessibility tree from the DOM, ARIA attributes and CSS. Extension content scripts cannot read that internal tree directly. They can read the DOM, ARIA attributes, labels, and computed styles.
- **\[FACT\]** The Chrome DevTools Protocol exposes an Accessibility domain (for example, a full-tree fetch). An extension can reach CDP through the `chrome.debugger` API, which requires the `debugger` permission and causes Chrome to show a banner indicating the tab is being debugged. Verify current behavior at build.
- **\[FACT\]** The accessible-name algorithm is specified (Accessible Name and Description Computation). Open-source implementations exist for computing names in JavaScript.
- **\[REC\]** The MVP computes roles, names and states from the DOM using such an implementation plus ARIA attribute reads, and calls the result an "accessibility snapshot". This differs from the source phrase "accessibility-tree extraction" only in mechanism; the intent (semantic, not visual, understanding) is preserved.
- **\[ASSUMP\]** The DOM-derived snapshot is sufficient for the two demo sites. Phase 0 spike S2 compares it to the CDP tree on both sites.
- **Honest limits:** if a page has no labels, a snapshot cannot recover meaning that markup does not carry. Skin can only infer from nearby text, and inference must be marked low-confidence and confirmed by the person or flagged.

### 9.4 Overlay placement and host-page treatment

- The content script creates one host element and attaches a shadow root. Overlay styles live inside it. \[FACT: shadow DOM encapsulates styles\]
- While the overlay is active, host-page content should be hidden from assistive technology and keyboard focus so a screen-reader user does not wander into the dense page underneath. Candidate mechanisms: the `inert` attribute on a wrapper, or `aria-hidden` plus focus management. \[ASSUMP\] Phase 0 spike S4 must confirm that programmatic actions (value setting and `dispatchEvent`) still work on elements inside an inert subtree. If not, use an alternative such as visually covering the page and trapping focus in the overlay.
- Do not use `display: none` on the host page by default; some pages measure layout or stop rendering controls when hidden. \[ASSUMP, verify\]
- Restoring: on exit, remove all attributes Skin added and restore focus.

### 9.5 Element addressing

Each interactive host element receives a Skin reference such as `f_017`, held in a content-script registry mapping ref to a weak element handle plus locators: `id`, `name`, label text, ARIA name, a structural path and a nearby-text anchor. When an element detaches (a re-render), the registry attempts re-resolution in that locator order and marks the reference `stale` if none matches. Skin avoids writing attributes into the host DOM where possible. \[REC\]

### 9.6 Action bridge

The bridge is the only component that touches host-page controls. It is deliberately conservative.

**Strategy ladder (try in order, verify after each):**

1. **Native-setter plus events \[MVP\].** For text-like inputs, call the browser's native value setter for the element's prototype, then dispatch bubbling `input` and `change` events. This is a widely used technique for React-controlled inputs because React tracks the value it last saw and ignores plain property assignment. It is a community technique, not an official React API, so treat it as needing verification per site. \[FACT/REC\]
2. **Focus and keyboard simulation \[MVP, limited\].** Focus the element and dispatch key events. Many frameworks ignore synthetic key events for text entry; use only where Strategy 1 fails and only for simple widgets.
3. **Trusted input via CDP \[Post-MVP\].** Use CDP input commands through the debugger permission to produce events the browser treats as real user input. \[FACT: CDP Input domain exists; verify behavior\] Costs: debugger banner, broader permission, store review burden. \[ASSUMP\]
4. **Handoff \[MVP\].** If verification still fails, highlight the real control and ask the person to complete it on the original page.

**Per-control rules:**

- Select: set via native setter, dispatch `change`; verify selected option text.
- Radio and checkbox: call the element's `click()`; verify checked state. Do not assume the host page's custom styled replacements map one-to-one with the hidden input.
- Date: prefer filling a native date input; for split day-month-year fields, fill each; verify the page's own parsed state if visible.
- Custom comboboxes and listboxes (ARIA patterns built from divs): attempt click-open then click-option; high failure risk; mark as \[FUTURE\] beyond the demo sites.
- File upload: not supported by the bridge; handoff.

**\[FACT\]** Events created by script have `isTrusted` set to false. Pages that reject untrusted events, require genuine gestures (for example, to open payment windows or trigger downloads), or use anti-automation measures will not respond to Strategies 1 and 2.

**Verification after every action:** read back the control's value or state; check `aria-invalid`, validity state and nearby new messages; record `status` in the action result (§12.5). Verification is read from the host DOM, not from Skin's memory.

### 9.7 Dynamic single-page applications

- A debounced `MutationObserver` watches the relevant subtree and triggers incremental snapshot diffs. \[FACT: API exists\]
- URL changes without page loads (History API) can be observed with the `webNavigation` extension API (history-state events) or by patching history methods in the page's main world via `chrome.scripting` with `world: "MAIN"`. \[FACT: both exist; verify permissions\]
- Frameworks that virtualize lists or replace nodes on every state change invalidate references frequently; Skin must tolerate stale references and re-resolve.
- Late-loaded content, skeleton screens and route transitions need a "settling" delay heuristic; no heuristic is perfect. \[ASSUMP\]
- This is the principal compatibility risk (§18, RISK-1).

### 9.8 Speech architecture

- **Output:** the Web Speech API's speech synthesis, run in the overlay. Voice availability varies by browser, operating system and language; check available voices at runtime. \[FACT\]
- **Input:** the Web Speech API's speech recognition. \[FACT\] In Chrome the implementation has historically sent audio to a remote service for recognition; newer on-device options may exist. \[ASSUMP, verify at build\] Speech recognition also requires microphone permission, and permission prompts and behavior differ when recognition runs in a content script (under the host page's origin), in an extension page, or in an offscreen document. \[ASSUMP\] Phase 0 spike S5 decides where recognition runs.
- **Quality:** recognition accuracy for numerals, names and Indian languages is variable. Skin's echo-and-confirm step (FR-I4) is not optional.
- **Fallback:** typed and tapped input is always available.

### 9.9 LLM generation pipeline

1. Skin builds a **structure-only** input: labels, accessible names, groups, constraints, option labels, error messages, headings and the person's language. No entered values, no existing field values.
2. A fixed system prompt instructs the model to return only JSON conforming to the UI spec schema, using only component names from the library and only field references present in the input.
3. The gateway requests structured output (tool use or JSON-schema-constrained output, per the provider's current documentation) to minimize malformed JSON. \[REC, verify provider capability\]
4. The extension validates the response locally against the schema, then applies semantic checks: every `fieldRef` exists; every component type is allowed; text fields contain plain text only (no markup); counts and step indices are consistent; no URLs.
5. On failure, retry once with the validation errors; on second failure, use the deterministic spec (AD-5).
6. Cache by a hash of the structural snapshot plus language so repeated activations are instant. \[REC\]
7. Text from the model is always rendered as text, never as HTML.

**Tables \[REC, MVP\]:** for RecordList the LLM receives only column headers and the table caption. Cell values are rendered locally; dates and numbers are formatted using the browser's `Intl` formatters. Free-text cells (for example, merchant names) stay in their original language.

## 10. Component Responsibilities

| Component | Responsibilities | Inputs | Outputs | Must not |
| --- | --- | --- | --- | --- |
| Service worker (orchestrator) | Handles toolbar click; injects content script; routes messages; calls LLM gateway; manages retries and cache | Activation events; snapshot; profile | UI spec; status | Hold long-lived state in memory (it can be terminated and restarted); touch host DOM |
| Snapshotter | Walks the DOM; computes roles, names, states, constraints; classifies sensitivity; builds groups and tables; registers element refs | Host DOM | PageSnapshot | Mutate host DOM; include entered values in outbound data |
| Mutation observer | Debounced change detection; incremental diffs; stale-ref marking | DOM mutations | Snapshot diffs | Trigger actions |
| Task model builder | Deterministically derives steps, required fields, error associations, destructive-action candidates | PageSnapshot | TaskModel | Invent fields |
| Spec generator (LLM path) | Calls gateway; validates; retries | Structure-only TaskModel + profile | UISpec | Emit HTML |
| Spec generator (deterministic path) | Produces a plain but correct UISpec from the TaskModel | TaskModel + profile | UISpec | Depend on network |
| Overlay renderer | Renders UISpec with the fixed component library; manages focus, live regions, transitions | UISpec; profile; ActionResults | UI; user events | Render untrusted markup |
| Voice service | Speech synthesis; recognition lifecycle; digit grouping; permission handling | Text; user speech | Spoken output; recognized text | Send audio anywhere beyond the disclosed path |
| Local validator | Mirrors host-declared constraints and a small library of known formats for friendly pre-checks | Answer; component validation | Valid or message | Override the host page as final authority |
| Action bridge | Executes ActionRequests via the strategy ladder; verifies; reports | ActionRequest | ActionResult | Act without a user-confirmed origin; submit without ConfirmAction |
| Profile store | Persists local preferences | Settings changes | Profile | Store answers or page content |
| LLM gateway | Authenticates callers; enforces rate limits; forwards requests; strips logging of content | Structure-only input | Raw model JSON | Log request bodies by default; hold user answers |

## 11. Data Flows

### DF-1 Activation to first screen

1. Person clicks the toolbar icon; the service worker injects the content script (user gesture grants temporary tab access under `activeTab`).
2. Content script shows a lightweight loading overlay with an immediate spoken and visual "Preparing a simpler view".
3. Snapshotter builds the PageSnapshot; task model builder derives the TaskModel.
4. Deterministic spec is produced immediately; the first screen can render from it.
5. In parallel, the service worker sends the structure-only input to the gateway; on a valid response, the spec is swapped in at the next step boundary (never mid-question).
6. Overlay performs the morph transition and reads the first prompt aloud if enabled.

### DF-2 Answer to host-page action

1. Person answers by voice, keyboard or tap.
2. Local validator checks; the overlay echoes the value; person confirms.
3. Overlay creates an ActionRequest with origin `user_confirmed`.
4. Action bridge resolves the element reference and runs the strategy ladder.
5. Bridge reads back the host state and returns an ActionResult.
6. On `ok`, overlay advances. On `mismatch`, `not_found` or `blocked`, overlay shows ErrorNotice or HandoffNotice.

### DF-3 Host error relay

1. After an action or navigation attempt, the observer detects new messages (`role=alert`, live regions, inline error nodes, `aria-invalid`).
2. Task model associates each message with a field where possible.
3. Overlay shows an ErrorNotice in plain language; the original text is available on request.

### DF-4 Page changes while active

1. Observer reports mutations; snapshot diff is computed.
2. If affected references are current-step fields, the overlay re-binds silently or, on failure, shows a short "The page changed" notice and re-extracts.
3. If the structure changed materially, regenerate the spec and ask the person before changing steps.

### DF-5 Review and submit

1. ReviewSummary reads all bound field values from the host DOM.
2. Person edits or confirms; ConfirmAction names the real page's submit control and its consequence in plain language.
3. Only on explicit confirmation does the bridge activate the host control; the host's response is observed and relayed.

### DF-6 Exit

Overlay closes, Skin-added attributes are removed, focus returns to the last relevant host control, and any cached structural data is dropped unless the person opted in.

## 12. Data Contracts and JSON Schemas

### 12.1 Conventions

- All messages carry `schemaVersion` (semantic version string).
- Schemas are expressed in JSON Schema (Draft 2020-12 recommended) and enforced with a validator library (§13). Examples below are illustrative; constraints in the bullet lists are normative.
- Unknown properties are rejected for LLM-produced documents (`additionalProperties: false`).
- Text fields are plain strings; maximum lengths are enforced.

### 12.2 PageSnapshot (extension-internal; outbound form is structure-only)

```json
{
  "schemaVersion": "1.0",
  "snapshotId": "snap_0001",
  "capturedAt": "2026-01-01T00:00:00Z",
  "origin": "https://example.test",
  "title": "Pension details",
  "lang": "en",
  "headings": [{"level": 1, "text": "Update your details"}],
  "groups": [{"ref": "g_03", "kind": "fieldset", "legend": "Identity", "fieldRefs": ["f_017"]}],
  "fields": [{
    "ref": "f_017",
    "tag": "input",
    "type": "text",
    "role": "textbox",
    "accessibleName": "Aadhaar No.",
    "nameSource": "label",
    "nameConfidence": "high",
    "description": "",
    "required": true,
    "constraints": {"pattern": "[0-9]{12}", "minLength": null, "maxLength": 12, "options": null},
    "state": {"disabled": false, "readOnly": false, "invalid": false},
    "sensitivity": "national_id",
    "groupRef": "g_03",
    "visible": true
  }],
  "tables": [],
  "messages": [],
  "actions": [{"ref": "a_01", "kind": "submit", "accessibleName": "Submit", "destructive": "unknown"}],
  "diagnostics": {"unlabeledFields": 0, "truncated": false}
}
```

Constraints:

- `nameSource` is one of `label`, `aria-labelledby`, `aria-label`, `placeholder`, `title`, `nearby-text`, `none`. `nearby-text` and `none` set `nameConfidence` to `low`.
- `sensitivity` is one of `none`, `unknown`, `password`, `otp`, `national_id`, `payment_card`, `bank_account`, `date_of_birth`, `contact`.
- Snapshot entries never contain current values. A separate local-only structure may hold values for read-back.
- `locators` (id, name, path, text anchor) exist only in the in-tab registry and are never sent outbound.

### 12.3 TaskModel

```json
{
  "schemaVersion": "1.0",
  "taskKind": "form",
  "title": "Update pension details",
  "steps": [{
    "stepId": "s2",
    "fieldRefs": ["f_017"],
    "required": true,
    "groupLabel": "Identity",
    "errorRefs": [],
    "confidence": "high"
  }],
  "finalActionRef": "a_01",
  "finalActionDestructive": "unknown"
}
```

Constraints: `taskKind` is `form`, `table`, `mixed` or `unknown`; `unknown` triggers limited mode (J6). Each `fieldRef` appears in at most one step.

### 12.4 UISpec (LLM output, validated)

```json
{
  "schemaVersion": "1.0",
  "language": "hi",
  "sourceLanguage": "en",
  "task": {"title": "पेंशन विवरण अपडेट करें", "totalSteps": 5, "kind": "form"},
  "steps": [{
    "stepId": "s2",
    "index": 2,
    "title": "आपका आधार नंबर",
    "component": {
      "type": "QuestionText",
      "prompt": "कृपया अपना 12 अंकों का आधार नंबर बोलें या लिखें।",
      "hint": "यह आपके आधार कार्ड पर छपा है।",
      "inputMode": "numeric",
      "speakAs": "digit_groups",
      "groupSize": 4
    },
    "bindings": [{"fieldRef": "f_017", "role": "value"}],
    "originalText": {"label": "Aadhaar No.", "lang": "en"},
    "sensitivity": "national_id"
  }]
}
```

Normative constraints:

- `steps[].component.type` is one of the 12 content components in §8.8. Shell components never appear.
- Each step has exactly one primary component. A multi-field concept (for example, a split date) is one component with several `bindings`.
- `bindings[].fieldRef` must exist in the PageSnapshot supplied. Unknown refs invalidate the spec.
- `validation` may only restate constraints present in the snapshot. Skin's local validator derives patterns itself (§10); the LLM cannot introduce new rules.
- `QuestionChoice` options must be a subset-equal mapping of the snapshot's options (same count, same order, translated labels); the original value is carried unchanged in `value`.
- `RecordList` carries column header translations only; cell data comes from local snapshot rows.
- No field may contain markup, URLs, script, or style. A string containing `<`, `>` or a URL scheme fails semantic validation.
- Length limits (targets): `title` 80, `prompt` 240, `hint` 240, option label 80 characters. \[REC\]
- `originalText` is copied by Skin from the snapshot, not trusted from the model.

Component-specific properties (each component object also has `type`):

- QuestionText: `prompt`, `hint?`, `inputMode` (`text`|`numeric`|`tel`|`email`), `speakAs` (`plain`|`digit_groups`|`spell`), `groupSize?`.
- QuestionDate: `prompt`, `parts` (`dmy`|`single`), `hint?`.
- QuestionChoice: `prompt`, `options[]` (`value`, `label`), `display` (`buttons`|`list`).
- QuestionMulti: as QuestionChoice plus `minSelected?`.
- QuestionConsent: `prompt`, `statement`.
- InfoBlock: `body`.
- RecordList: `columns[]` (`ref`, `label`), `emphasis?` (`column ref`).
- RecordDetail: `recordRef`, `labels`.
- ReviewSummary: `title`, `editLabel`.
- ConfirmAction: `consequence`, `actionRef`, `confirmLabel`, `cancelLabel`.
- ErrorNotice: `message`, `fieldRef?`.
- HandoffNotice: `reason` (`password`|`otp`|`captcha`|`upload`|`other`), `instruction`.

### 12.5 ActionRequest and ActionResult

```json
{
  "schemaVersion": "1.0",
  "actionId": "act_0042",
  "type": "setValue",
  "fieldRef": "f_017",
  "value": "123412341234",
  "origin": "user_confirmed",
  "requiresConfirmation": false
}
```

```json
{
  "schemaVersion": "1.0",
  "actionId": "act_0042",
  "status": "ok",
  "strategyUsed": "native_setter",
  "observed": {"value": "123412341234", "invalid": false},
  "hostMessages": [],
  "timestamp": "2026-01-01T00:00:00Z"
}
```

(The values above are synthetic examples.)

- `type`: `setValue`, `selectOption`, `check`, `uncheck`, `click`, `focus`, `readBack`.
- `origin`: `user_confirmed` or `system_readback`. Any `click` on a control the TaskModel marks as submit or destructive requires `requiresConfirmation: true` and a preceding ConfirmAction.
- `status`: `ok`, `mismatch`, `not_found`, `stale`, `blocked`, `untrusted_event_rejected`, `error`. `untrusted_event_rejected` is only reported when verification shows the host ignored the event; Skin cannot directly observe a page's internal `isTrusted` check.
- Action requests are never produced by the LLM. They are created by overlay code from confirmed user answers.

### 12.6 Profile

```json
{
  "schemaVersion": "1.0",
  "language": "hi",
  "textSize": "larger",
  "contrast": "standard",
  "voiceOutput": true,
  "voiceInput": true,
  "speechRate": 1.0,
  "autoReadAloud": true,
  "disclosuresAccepted": {"llm": true, "speech": true}
}
```

## 13. Technology Stack and Official Documentation

All entries are recommendations unless marked otherwise. Verify versions and API status at build time.

| Layer | Choice | Why | Official documentation |
| --- | --- | --- | --- |
| Extension platform | Chrome Extensions, Manifest V3 | Required for current Chrome extensions | https://developer.chrome.com/docs/extensions |
| In-page code | Content scripts (isolated world) | DOM access without page-script access | https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts |
| Orchestration | Service worker | Event-driven background logic | https://developer.chrome.com/docs/extensions/develop/concepts/service-workers |
| Permissions | `activeTab`, `scripting`, `storage` | Minimal footprint | https://developer.chrome.com/docs/extensions/develop/concepts/activetab |
| Injection API | `chrome.scripting` | On-demand injection; main-world option | https://developer.chrome.com/docs/extensions/reference/api/scripting |
| Storage | `chrome.storage` | Local profile | https://developer.chrome.com/docs/extensions/reference/api/storage |
| Fallback UI | `chrome.sidePanel` | Alternative to in-page overlay | https://developer.chrome.com/docs/extensions/reference/api/sidePanel |
| Optional speech host | Offscreen documents | Possible host for recognition | https://developer.chrome.com/docs/extensions/reference/api/offscreen |
| Optional trusted input and AX tree | `chrome.debugger` and CDP | Post-MVP | https://developer.chrome.com/docs/extensions/reference/api/debugger |
| CDP reference | Accessibility and Input domains | Full AX tree; trusted input | https://chromedevtools.github.io/devtools-protocol/ |
| Accessible names | An implementation of the accname spec (for example, `dom-accessibility-api`) | Role and name computation | https://www.w3.org/TR/accname-1.2/ ; https://github.com/eps1lon/dom-accessibility-api |
| ARIA | WAI-ARIA and the ARIA Authoring Practices Guide | Overlay and widget patterns | https://www.w3.org/TR/wai-aria-1.2/ ; https://www.w3.org/WAI/ARIA/apg/ |
| Change detection | `MutationObserver` | SPA handling | https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver |
| Isolation | Shadow DOM | Style isolation for the overlay | https://developer.mozilla.org/en-US/docs/Web/API/Web\_components/Using\_shadow\_DOM |
| Voice | Web Speech API (synthesis and recognition) | Browser-native speech | https://developer.mozilla.org/en-US/docs/Web/API/Web\_Speech\_API |
| Localization | `Intl` formatters | Local date and number formatting | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global\_Objects/Intl |
| LLM | Claude API via your own gateway | Structured JSON generation | https://docs.claude.com |
| Schema validation | JSON Schema with a validator such as Ajv, or Zod types | Strict spec validation | https://json-schema.org ; https://ajv.js.org ; https://zod.dev |
| UI | React and TypeScript | Team velocity; strong typing for component library | https://react.dev ; https://www.typescriptlang.org/docs/ |
| Build | Vite with an extension framework such as WXT | Fast iteration for MV3 | https://vite.dev ; https://wxt.dev |
| Unit testing | Vitest | Fast TypeScript tests | https://vitest.dev |
| Extension E2E | Playwright with the extension loaded in a persistent context | Scripted demo-site tests | https://playwright.dev/docs/chrome-extensions |
| Accessibility testing | axe-core | Automated checks of the overlay | https://github.com/dequelabs/axe-core |
| Standards | WCAG 2.2 | Accessibility target | https://www.w3.org/TR/WCAG22/ |
| Built-in browser AI (future) | Chrome built-in AI APIs (translation, summarization, prompt) | Possible on-device paths | https://developer.chrome.com/docs/ai/built-in |

Notes: \[FUTURE\] The built-in AI APIs vary in availability, hardware requirements and stability; treat them as optional research, not an MVP dependency. \[ASSUMP\] Whether Chrome's speech recognition can run on-device for the target languages must be checked directly.

## 14. Development Roadmap

No calendar is imposed because the available timebox is unknown. \[ASSUMP\] Phases are ordered by risk reduction; each has exit criteria.

### Phase 0 — Risk spikes (do first)

| Spike | Question | Exit criterion |
| --- | --- | --- |
| S1 | Do native-setter plus events populate React-controlled inputs on the mock government form built with React? | Each demo field type updates both visible value and framework state |
| S2 | Is the DOM-derived accessibility snapshot sufficient on both mock sites versus the CDP tree? | Documented gaps and a go or no-go on the CDP path |
| S3 | Does the overlay in a shadow root render correctly under strict host CSS, and does the morph work? | A working morph on both mock sites |
| S4 | Do programmatic actions work on elements under `inert` or alternative hiding? | One chosen hiding mechanism |
| S5 | Where should speech recognition run, and does it work for Hindi and English? | Decision plus fallback; list of observed failures |
| S6 | Can a schema-constrained LLM call return valid UI specs for both sites? | Valid-spec rate recorded honestly across repeated runs |

### Phase 1 — Skeleton

Extension scaffold, activation, snapshotter, overlay shell, profile store, schema definitions and validators.

### Phase 2 — Form journey

Task model builder, deterministic spec generator, QuestionText, QuestionDate, QuestionChoice, QuestionConsent, ReviewSummary, ConfirmAction, ErrorNotice, action bridge with verification.

### Phase 3 — Table journey

RecordList and RecordDetail, table snapshot, local formatting, read-only voice queries (for example, "largest debit") resolved locally from snapshot rows.

### Phase 4 — LLM, language and voice

Gateway, structured generation, retry and fallback, Hindi and English copy, speech output and input, echo-and-confirm.

### Phase 5 — Hardening and demo

Accessibility pass with a real screen reader, failure-path rehearsal, demo script, offline fallback, recorded evidence of real results (only actual ones).

### Post-MVP

Multi-page wizards; iframes and open shadow DOM; trusted-input path; additional languages; activity log; institution hint files; profile sync.

## 15. Repository Structure

A monorepo is recommended so that schemas, extension code, the gateway and fixtures version together. \[REC\]

```
skin/
  README.md
  docs/
    PROJECT_MASTER_DOCUMENT.md      this document, exported
    adr/                            architecture decision records (AD-n)
    spikes/                         Phase 0 spike reports (real results only)
    demo/                           demo script, rehearsal checklist
  packages/
    schemas/                        JSON Schemas and generated types:
                                    PageSnapshot, TaskModel, UISpec, Action*, Profile
    extension/
      src/background/               service worker: orchestration, gateway client, cache
      src/content/
        snapshot/                   snapshotter, accessible names, sensitivity classifier
        observer/                   mutation and navigation observers
        taskmodel/                  deterministic task model builder
        bridge/                     element registry, strategy ladder, verification
        overlay/                    shadow-root host, renderer, components/, shell/, morph/
      src/speech/                   synthesis, recognition, digit grouping
      src/spec/                     deterministic generator, validator, semantic checks
      src/i18n/                     strings (hi, en), glossary
      src/shared/                   message types, profile store
    gateway/                        LLM gateway: schema-constrained call, rate limits
  prompts/                          versioned system prompts and example specs
  fixtures/
    site-a-pension-form/            mock government-style form, synthetic data
    site-b-bank-table/              mock bank-style statement, synthetic data, read-only
  tests/
    unit/                           validators, snapshotter, task model, formatting
    e2e/                            Playwright journeys against the fixtures
    a11y/                           axe checks and the manual screen-reader protocol
    prompts/                        repeated spec-generation runs with recorded outcomes
```

## 16. Security and Privacy Model

### 16.1 Principles \[REC\]

Data minimization, explicit consent, local-first processing, least privilege, and no autonomous irreversible actions. This section is a design intent; it is not legal advice and must be reviewed against applicable law and institutional terms before any real-world deployment.

### 16.2 Data classification

| Data | Examples | Sensitivity | Default handling |
| --- | --- | --- | --- |
| Page structure | Labels, headings, option lists, error text | Low to medium (can reveal the service the person uses) | May be sent to the LLM gateway after the person's disclosure acceptance |
| Entered values | Aadhaar-style number, DOB, address, phone | High | Never sent to the LLM; held in memory only while needed; written only to the host page |
| Existing host values and table cells | Balances, transactions | High | Never sent to the LLM in MVP; rendered locally |
| Voice audio | Spoken answers | High | Goes wherever the speech-recognition implementation sends it; disclose plainly (§16.4) |
| Credentials and one-time codes | Passwords, OTPs | Critical | Never read, spoken, echoed or stored by Skin; handoff to the original page |
| Profile | Language, text size | Low | Stored locally via extension storage |

### 16.3 Threat model

| Threat | Description | Mitigation |
| --- | --- | --- |
| Prompt injection via page content | Host-page text (visible or hidden) tries to instruct the model | Page text is passed only as data in a structure-only payload; the model has no tools and cannot trigger actions; output is schema-validated; ignored hidden elements; length caps; actions come only from user-confirmed overlay events |
| Malicious or malformed model output | Markup, scripts, links or invented controls in the spec | Closed component set; plain-text-only fields; forbidden characters and URL patterns; fieldRef existence checks; render as text nodes |
| Wrong-field writes | Misbinding an answer to the wrong control | Read-back verification; echo-and-confirm; review screen reads from host DOM; ConfirmAction before submit |
| Data leakage via gateway | Request logs retain page structure | Gateway does not log bodies by default; short retention if any logging; authentication and rate limits |
| Key theft | LLM key extracted from the extension | Key lives only on the gateway (AD-4) |
| Overbroad permissions | Extension can read every site | `activeTab` and on-demand injection (AD-7); optional per-site permissions later |
| Overlay spoofing | A host page tries to imitate or interfere with the overlay | Overlay in a shadow root created by the extension; Skin does not trust host-page events delivered to it; ephemeral secret-free messaging |
| Over-trust by the person | Believing Skin guarantees correctness | Always show the review screen; persistent translation disclaimer; "Show original" |
| Remote code | Fetching executable logic at runtime | **\[FACT\]** Manifest V3 disallows remotely hosted code; the component library ships in the package and only data (JSON) comes from the network |

### 16.4 Speech privacy (honest statement)

- Speech synthesis typically runs locally or via voices provided by the OS or browser; verify per platform. \[ASSUMP\]
- **Speech recognition in Chrome has historically sent audio to a remote service.** \[FACT, verify current behavior\] A person who speaks an identity number into the microphone may therefore be sending that audio to a third party. Skin must say this before enabling voice input, offer typed input as an equal alternative, and never describe voice input as private or offline unless an on-device path has been verified for the language. \[REC\]
- Microphone access is requested only after the person turns on voice input, and is released when they stop.
- No audio is recorded or stored by Skin.

### 16.5 Sensitive-field policy \[REC\]

- Passwords, OTPs, PINs and CAPTCHAs: HandoffNotice only. Skin does not read, speak, transform or relay them.
- National IDs and payment cards: allowed in the demo only with synthetic data. For real use, voice entry of these fields should default to off with an explicit warning (the audio path in §16.4). Echo-and-confirm should display the value on screen and avoid reading it aloud when the person is in a public setting; provide a "mute readout of numbers" option.
- Bank flows: the MVP bank demo is read-only. Skin must not move money or change payees in MVP.

### 16.6 Legal and trust considerations \[ASSUMP\]

- Automating or re-rendering a third-party portal may conflict with that site's terms of use; banks and government portals may also have security and regulatory expectations. The MVP uses self-built mock sites for this reason.
- Handling identity numbers and financial data is regulated in many jurisdictions. Treat all real deployment as requiring legal review.
- Browser extension stores impose permission and data-use disclosure requirements; broad permissions increase review burden.

### 16.7 Disclosures shown to the person (plain language, in their language)

1. Skin reads this page on this tab when you press the icon.
2. Skin sends the page's headings and field names, not what you type, to an AI service to make the simpler view.
3. If you use voice input, your voice may be sent to a speech service operated by your browser vendor.
4. Skin never submits anything without your confirmation.
5. Translations may be imperfect; you can always see the original text.

## 17. Accessibility Requirements

SKIN is an accessibility product; its overlay must itself be exemplary. Target: WCAG 2.2 Level AA for the overlay as a design target. Conformance is not claimed until it is audited. \[REC\]

### 17.1 Requirements

- **A11Y-1 Semantics:** the overlay uses real landmarks (`main`, `nav`), one level-1 heading per screen (the step title), labelled inputs, and native elements for native behavior. (WCAG 1.3.1, 4.1.2)
- **A11Y-2 Keyboard:** every function is operable by keyboard; no keyboard traps; logical tab order; visible, high-contrast focus. (2.1.1, 2.1.2, 2.4.3, 2.4.7)
- **A11Y-3 Focus management:** on step change, focus moves to the step heading or first control; on exit, focus returns to the host page's last relevant control.
- **A11Y-4 Live regions:** errors and confirmations announced via a polite live region; do not interrupt reading with assertive announcements except for blocking errors. (4.1.3)
- **A11Y-5 Contrast and sizing:** 4.5:1 body text, 3:1 large text and components; text resizable to 200 percent without loss; reflow at narrow widths; user-adjustable text spacing does not break layout. (1.4.3, 1.4.4, 1.4.10, 1.4.11, 1.4.12)
- **A11Y-6 Target size:** primary targets at least 48 px; never below the 24 px minimum. (2.5.8)
- **A11Y-7 Language:** correct `lang` on the overlay and on mixed-language segments; original-language text marked with its own `lang`. (3.1.1, 3.1.2)
- **A11Y-8 Errors:** errors identified in text, associated with the control, and accompanied by a suggestion where the host supplies one; error prevention (review and confirm) before irreversible submissions. (3.3.1, 3.3.2, 3.3.3, 3.3.4)
- **A11Y-9 Redundant entry:** do not ask the person to re-enter information already provided in the same session. (3.3.7)
- **A11Y-10 Motion:** honor `prefers-reduced-motion`; no flashing; no auto-advancing timers. (2.2.2, 2.3.1)
- **A11Y-11 No time pressure:** no countdowns introduced by Skin; if the host page has a session timeout, relay it clearly and early.
- **A11Y-12 Alternatives to voice:** every voice interaction has a typed or tapped equivalent.
- **A11Y-13 Screen-reader mode:** a setting ("I use a screen reader") turns off Skin's own speech output to avoid double speech, and ensures all prompts reach the screen reader through the semantic DOM and live regions.
- **A11Y-14 Cognitive load:** one primary question per screen; consistent button placement; short sentences; no jargon without an explanation.
- **A11Y-15 Host-page labeling repair:** when the host control has no accessible name and the snapshot infers one with low confidence, the overlay shows the inferred label and flags it as inferred.

### 17.2 Known accessibility trade-offs

- Hiding or inerting the host page protects overlay users but also removes the original from assistive-technology reach; "Use original page" restores it fully.
- Skin's own speech may conflict with a screen reader; A11Y-13 mitigates but needs real-world testing with actual users.

## 18. Limitations, Risks and Fallbacks

### 18.1 Plain statements of limitation

- SKIN will not work reliably on arbitrary sites. Compatibility is demonstrated only on fixtures in the MVP.
- **Accessibility tree:** extensions cannot read the browser's internal tree directly from a content script. The MVP's snapshot is DOM-derived; true tree access needs CDP and the debugger permission, with user-visible consequences. A page with poor markup yields a poor snapshot.
- **Synthetic events:** script-dispatched events are untrusted. Some sites ignore or block them. Skin verifies outcomes and hands off when verification fails.
- **React and other controlled inputs:** plain value assignment may not update framework state. The native-setter technique works in many cases but is not guaranteed.
- **Dynamic SPAs:** nodes are replaced, content loads late, routes change without page loads, lists are virtualized. Skin's references can go stale. This is the highest compatibility risk.
- **Structures Skin cannot see or drive:** closed shadow roots, cross-origin iframes (including many payment and identity widgets) without per-frame injection, canvas-rendered UIs, embedded PDFs, and native file pickers.
- **Authentication and anti-automation:** logins with MFA, CAPTCHAs and bot-detection are intentionally not handled.
- **Speech:** recognition accuracy for numerals, names and some Indian languages varies; audio may leave the device; synthesized voices may be unavailable for a given language.
- **Translation and rewriting:** LLM rewriting may be imprecise on legal and financial language. Skin cannot certify correctness.
- **Latency and cost:** every activation may call an LLM; caching and the deterministic path reduce but do not remove this.

### 18.2 Risk register

Likelihood and impact are qualitative judgments, not measurements. \[ASSUMP\]

| ID | Risk | L / I | Mitigation | Fallback |
| --- | --- | --- | --- | --- |
| RISK-1 | Brittleness on complex SPAs | High / High | Fixture-only MVP; tolerant re-resolution; observer debouncing | Limited mode or original page; list supported patterns explicitly |
| RISK-2 | Synthetic events rejected or React state not updated | Medium / High | Spike S1; native-setter strategy; read-back verification | Trusted-input path (post-MVP); handoff |
| RISK-3 | DOM snapshot misses semantics the true tree has | Medium / Medium | Spike S2; CDP option | Low-confidence labels flagged; person confirms |
| RISK-4 | Speech recognition fails, is inaccurate, or has privacy concerns | High / Medium | Echo-and-confirm; disclosure; typed alternative | Voice input off by default for sensitive fields |
| RISK-5 | Mistranslation of important terms | Medium / High | Keep source terms; glossary; show original; no invented content | Switch to English or show original only |
| RISK-6 | LLM returns invalid or slow responses | Medium / Medium | Schema validation, one retry, cache | Deterministic spec generator |
| RISK-7 | Prompt injection through page text | Medium / High | §16.3 mitigations | Deterministic spec generator |
| RISK-8 | Hiding the host page breaks actions or focus | Medium / Medium | Spike S4 | Alternative hiding method |
| RISK-9 | Legal or terms-of-use conflict with target sites | Medium / High | Mock sites; legal review before real use | Institution partnership model (future) |
| RISK-10 | Person over-trusts Skin | Medium / High | Review screen; disclaimers; confirm gates | None beyond design |
| RISK-11 | Live-demo failure (network, microphone, venue noise) | High / High | Deterministic path; offline-capable fixtures; typed fallback; rehearsed failure path | Recorded real run, clearly labelled as a recording |
| RISK-12 | Permission or store-review friction | Medium / Medium | Minimal permissions | Sideload for demo |
| RISK-13 | Overlay accessibility defects | Medium / High | Automated and manual audit | Prioritized fixes before any release |

## 19. Testing and Acceptance Criteria

### 19.1 Strategy

1. **Unit tests:** schema validators, semantic checks, snapshotter outputs on saved HTML, task model builder, digit grouping, local validators, locale formatting.
2. **Fixture E2E tests (Playwright):** scripted journeys J1–J6 against fixtures, with the extension loaded.
3. **Prompt validity runs:** repeated spec generation per fixture; record the actual count of valid specs and failure reasons; no number is claimed until recorded.
4. **Accessibility testing:** automated axe runs against the overlay plus a manual protocol using real assistive technology (a screen reader on desktop Chrome, OS magnification, high contrast, keyboard-only).
5. **Failure injection:** disable network, deny microphone, remove labels, mutate DOM mid-step, force a validation error, force a stale reference.
6. **Usability review (post-MVP recommended):** sessions with real older adults, low-vision users and second-language readers, with informed consent and no real personal data. \[FUTURE\]

### 19.2 Test cases (examples; IDs trace to requirements)

| ID | Verifies | Pass condition |
| --- | --- | --- |
| TEST-01 | FR-C1, FR-C2 | Activation on fixture A yields a snapshot with all fields, labels and required flags |
| TEST-02 | FR-U2, FR-R1 | Task model creates 5 single-question steps for fixture A |
| TEST-03 | FR-G1, FR-G4 | Spec containing markup, URL or unknown component is rejected |
| TEST-04 | FR-G3, NFR-2 | With the gateway blocked, a correct deterministic spec renders |
| TEST-05 | FR-A1–A3 | Each fixture-A field value set via bridge is read back correctly and the form's own validation passes |
| TEST-06 | FR-A4 | Submit control is not activated without a ConfirmAction acceptance |
| TEST-07 | FR-A5 | Password-type field produces a HandoffNotice; no value passes through Skin |
| TEST-08 | FR-U3, FR-A6 | A server-style validation error on fixture A appears as ErrorNotice with the original text available |
| TEST-09 | FR-I1, FR-I2, FR-I4 | Voice output reads the prompt; recognized digits are echoed in groups before write |
| TEST-10 | FR-I3, A11Y-1–4 | Keyboard-only completion of fixture A; axe reports no critical violations on the overlay |
| TEST-11 | FR-R4, A11Y-10 | With reduced motion enabled, the morph is replaced by an instant cross-fade |
| TEST-12 | FR-S1 | "Use original page" restores focus and leaves entered values intact on the host page |
| TEST-13 | FR-C3 | A mid-step DOM mutation re-binds or shows the page-changed notice; no wrong-field write |
| TEST-14 | §16.2 | Outbound gateway payload inspection shows no entered values or host values |
| TEST-15 | J2 | Fixture B renders a RecordList; a spoken or typed "largest debit" resolves locally to the correct row |

### 19.3 Standing rule on results

Test outcomes are reported exactly as observed, including failures. No document or presentation may describe a test as passed unless a recorded run exists.
