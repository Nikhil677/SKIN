# SKIN — Adaptive Web Accessibility Engine

> **Re-render any website as an interface built for you.**
> Transform complex, overwhelming websites into calm, step-by-step, personalized experiences while keeping the original website as the functional backend.

---

## 1. What is Skin?

Dense government portals and banking statement dashboards defeat older adults, low-vision users, and second-language readers. Traditional "accessibility overlays" only adjust colors or zoom in on already broken layouts, and "reader modes" strip away interactive forms entirely.

**Skin takes a fundamentally different approach:**
1. It inspects the host page DOM and extracts semantic information (labels, inputs, constraints, tables).
2. It generates a structured, accessible interaction specification (`UISpec`) based on a closed set of 12 accessible components.
3. It renders a clean, large-type, one-question-at-a-time interface inside an isolated **Shadow DOM**.
4. Every interaction (text entry, dropdown selection, checkbox toggle, submission) is wired directly back to the original host page controls via the **Action Bridge's Native Setter Ladder**. The host page remains loaded underneath as the live backend and system of record!

---

## 2. Key Features Implemented

- **Chrome Extension Manifest V3**: Built with TypeScript and WXT, generating a production bundle in `apps/extension/.output/chrome-mv3`.
- **Shadow DOM Style Isolation**: The overlay is completely insulated from host webpage CSS conflicts.
- **One-Question-at-a-Time Wizard Navigation**: Breaks dense multi-section forms into a step-by-step calm progression with clear progress indicators.
- **Bidirectional DOM Action Bridge**:
  - Uses the **Native Prototype Setter Ladder** (`Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')`) to seamlessly update React, Angular, and Vue controlled inputs.
  - Dispatches synthetic bubbling `input` and `change` events.
  - Performs immediate read-back verification directly from the host DOM to confirm the value was accepted.
- **Accessible Component Library (Closed Set)**:
  - `QuestionText` with digit-group formatting for national IDs (e.g., Aadhaar 12-digit spacing `1234 5678 9012`).
  - `QuestionDate` with accessible date picker.
  - `QuestionChoice` with large touch cards and thick high-contrast focus rings.
  - `QuestionConsent` with clear affirmation toggles.
  - `RecordList` with high-contrast transaction cards, debit/credit badges, instant search, and voice query resolution (e.g. "largest debit").
  - `ReviewSummary` reading back all values directly from the host DOM with one-click "Change" edit buttons.
  - `ConfirmAction` gating irreversible form submission with explicit user confirmation.
  - `VoiceEchoModal` displaying speech recognition results with confirmation before accepting.
- **Voice Input & Output**:
  - Web Speech Synthesis: Reads questions and instructions aloud in English or Hindi.
  - Web Speech Recognition: Allows answering questions by speaking, echoing recognized text for confirmation.
- **Personalization Controls**:
  - Language: English (`en`), Hindi (`hi`), Tamil (`ta`), Telugu (`te`), Bengali (`bn`), Marathi (`mr`).
  - Text Size presets: Large (`A`), Larger (`A+`), Largest (`A++`).
  - Contrast presets: Standard and High Contrast (black background with high-visibility yellow borders & text).
- **Security & Privacy by Design**:
  - Zero sensitive values (passwords, OTPs, PINs, card numbers) are sent to any external service.
  - Prompt injection protection: LLM outputs are strictly validated against a closed Zod schema; arbitrary HTML tags, scripts, or URLs are rejected.
  - Submissions and destructive actions are gated by an explicit confirmation dialog.

---

## 3. Demonstration Scenarios

The included demo application (`apps/demo`) provides two realistic testbed portals:

### Scenario A: Government-style Multi-Step Form (Hero Journey — Savitri)
- **Host Page**: Dense 5-section Ministry Pension Portal (Form 14-B) with multiple columns, small text, required fields, dropdowns, validation alerts, and Aadhaar numbers.
- **Skin Transformation**: Collapses into a serene, one-question-at-a-time experience in Hindi or English, formatting the 12-digit Aadhaar number in clear digit groups, updating the underlying React form in real-time, and verifying the final submission.

### Scenario B: Bank-style Transaction Statement (Journey — Imran)
- **Host Page**: Multi-column Apex National Commercial Bank statement with dense figures, debit/credit columns, and search filters.
- **Skin Transformation**: Transforms the wide table into large readable cards with distinct credit/debit indicators, search filtering, and voice shortcuts ("largest debit", "all records").

---

## 4. Repository Structure

```text
skin/
├── apps/
│   ├── extension/              # Chrome MV3 Extension (WXT + React 19)
│   │   ├── entrypoints/
│   │   │   ├── background.ts   # Service worker
│   │   │   ├── content/        # Content script mounting Shadow DOM overlay
│   │   │   └── popup/          # Extension toolbar popup
│   │   ├── src/
│   │   │   ├── components/     # Accessible UI components (Progress, QuestionText, RecordList, etc.)
│   │   │   ├── voice/          # Web Speech synthesis and recognition
│   │   │   └── profile/        # Preferences storage
│   │   └── wxt.config.ts
│   │
│   └── demo/                   # Realistic demonstration web application (React + Vite)
│       └── src/
│           ├── pages/
│           │   ├── GovernmentForm.tsx  # Scenario A: Pension Portal
│           │   └── BankDashboard.tsx   # Scenario B: NetBanking Statement
│           └── App.tsx
│
├── packages/
│   └── shared/                 # Core domain logic, schemas, and engines
│       └── src/
│           ├── schemas/        # Zod contracts (PageSnapshot, TaskModel, UISpec, ActionRequest)
│           ├── perception/     # DOM snapshotter and TaskModel builder
│           ├── bridge/         # ElementRegistry and ActionBridge with Native Setter Ladder
│           ├── generator/      # Deterministic & AI UI Spec generators
│           └── i18n/           # Localized strings and dictionaries
│
├── tests/                      # Automated Vitest test suites (22 tests)
│   └── unit/
│       ├── schemas.test.ts     # Schema contract validation & security injection checks
│       ├── perception.test.ts  # DOM extraction testing on forms and tables
│       ├── bridge.test.ts      # Native setter ladder & verification testing
│       ├── generator.test.ts   # UI Spec generation testing in English and Hindi
│       ├── a11y-overlay.test.tsx # Component accessibility & keyboard navigation
│       └── e2e-journeys.test.tsx # Full end-to-end user journeys (J1, J2, J5)
│
├── docs/
│   ├── PROJECT_MASTER_DOCUMENT.md  # Primary specification and source of truth
│   ├── ARCHITECTURE.md             # System architecture and data flow
│   ├── DECISIONS.md                # Architecture Decision Records (ADRs)
│   └── DEVELOPMENT.md              # Local developer instructions
│
├── package.json
└── README.md
```

---

## 5. Quick Start Instructions

### Prerequisites
- Node.js >= 20
- npm >= 10
- Google Chrome browser

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Automated Tests
```bash
npm test
```
*Executes all 22 automated tests covering schemas, perception, the action bridge, spec generation, overlay accessibility, and end-to-end user journeys.*

### 3. Build Extension and Demo
```bash
npm run build
```
This builds:
- `@skin/shared`: TypeScript types and schemas
- `@skin/demo`: Vite web application in `apps/demo/dist`
- `@skin/extension`: Chrome MV3 extension in `apps/extension/.output/chrome-mv3`

### 4. Start the Demo Website
```bash
npm run dev:demo
```
Open **[http://localhost:5173](http://localhost:5173)** in Google Chrome.

---

## 6. How to Load the Extension in Google Chrome

1. Open Google Chrome.
2. In the URL bar, go to:
   ```text
   chrome://extensions
   ```
3. In the top right corner, enable **Developer mode**.
4. In the top left corner, click **Load unpacked**.
5. Select the following directory:
   ```text
   /home/Nikhil/hackathon/RMIT/SKIN/apps/extension/.output/chrome-mv3
   ```
6. The extension **SKIN — Adaptive Web Accessibility** is now installed!
7. Navigate to the demo website at **[http://localhost:5173](http://localhost:5173)**.
8. Activate Skin either by:
   - Clicking the **SKIN** extension icon in the Chrome toolbar.
   - Or clicking the **Activate SKIN** floating badge at the bottom right of the page.
