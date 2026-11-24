import { PageSnapshot, FieldSnapshot } from "../schemas/snapshot.js";
import { TaskModel } from "../schemas/taskmodel.js";
import { Profile } from "../schemas/profile.js";
import { UISpec, UISpecStep, Component } from "../schemas/uispec.js";
import { getI18n } from "../i18n/translations.js";

export function generateDeterministicUISpec(
  snapshot: PageSnapshot,
  taskModel: TaskModel,
  profile: Profile
): UISpec {
  const lang = profile.language || "en";
  const strings = getI18n(lang);

  // 1. Table Flow (e.g. Bank Statements)
  if (taskModel.taskKind === "table" && snapshot.tables.length > 0) {
    const table = snapshot.tables[0];
    const columns = table.columns.map((c) => ({
      ref: c.ref,
      label: translateColumnLabel(c.label, lang),
    }));

    const step: UISpecStep = {
      stepId: "step_table",
      index: 1,
      title: lang === "hi" ? "आपके बैंक लेन-देन" : "Your Account Transactions",
      component: {
        type: "RecordList",
        title: table.caption || strings.tableTitle,
        columns,
        emphasis: "col_4", // Highlight amount column
        searchable: true,
        filterOptions: ["All", "Debit", "Credit"],
      },
      bindings: [],
      sensitivity: "none",
      required: false,
    };

    return {
      schemaVersion: "1.0",
      language: lang,
      sourceLanguage: snapshot.lang || "en",
      task: {
        title: lang === "hi" ? "सरल बैंक विवरण" : "Simplified Account Statement",
        totalSteps: 1,
        kind: "table",
      },
      steps: [step],
    };
  }

  // 2. Form Flow (e.g. Pension Application)
  const steps: UISpecStep[] = [];
  let index = 1;

  for (const stepDef of taskModel.steps) {
    const field = snapshot.fields.find((f) => f.ref === stepDef.fieldRefs[0]);
    if (!field) continue;

    const component = createComponentForField(field, lang);
    const title = getFriendlyStepTitle(field, lang, index);

    steps.push({
      stepId: stepDef.stepId,
      index: index++,
      title,
      component,
      bindings: [{ fieldRef: field.ref, role: "value" }],
      originalText: {
        label: field.accessibleName,
        lang: snapshot.lang || "en",
        description: field.description || undefined,
      },
      sensitivity: field.sensitivity,
      required: field.required,
    });
  }

  // Add Review Summary Step
  const reviewStepIndex = index++;
  steps.push({
    stepId: "step_review",
    index: reviewStepIndex,
    title: strings.reviewTitle,
    component: {
      type: "ReviewSummary",
      title: strings.reviewTitle,
      editLabel: strings.edit,
    },
    bindings: [],
    sensitivity: "none",
    required: false,
  });

  // Add Final Confirm & Submit Step (if final action exists)
  if (taskModel.finalActionRef) {
    const confirmStepIndex = index++;
    steps.push({
      stepId: "step_confirm_action",
      index: confirmStepIndex,
      title: lang === "hi" ? "आवेदन जमा करने की पुष्टि" : "Confirm & Submit Application",
      component: {
        type: "ConfirmAction",
        consequence: strings.confirmPrompt,
        actionRef: taskModel.finalActionRef,
        confirmLabel: strings.submitConfirm,
        cancelLabel: strings.cancel,
      },
      bindings: [],
      sensitivity: "none",
      required: true,
    });
  }

  return {
    schemaVersion: "1.0",
    language: lang,
    sourceLanguage: snapshot.lang || "en",
    task: {
      title: lang === "hi" ? "पेंशन विवरण अपडेट करें" : (taskModel.title || "Government Portal Application"),
      totalSteps: steps.length,
      kind: "form",
    },
    steps,
  };
}

function createComponentForField(field: FieldSnapshot, lang: string): Component {
  const { type, accessibleName, constraints, sensitivity } = field;

  // Sensitivity: Password / OTP handoff
  if (sensitivity === "password" || sensitivity === "otp") {
    return {
      type: "HandoffNotice",
      reason: sensitivity === "password" ? "password" : "otp",
      instruction:
        lang === "hi"
          ? "कृपया सुरक्षा कारणों से अपना पासवर्ड / ओटीपी मूल पृष्ठ पर दर्ज करें।"
          : "For your privacy, please enter this sensitive code on the original website.",
    };
  }

  // Date input
  if (type === "date" || sensitivity === "date_of_birth") {
    return {
      type: "QuestionDate",
      prompt:
        lang === "hi"
          ? `कृपया अपनी ${accessibleName} दर्ज करें:`
          : `Please enter your ${accessibleName}:`,
      hint: lang === "hi" ? "दिनांक, माह और वर्ष चुनें" : "Select day, month, and year",
      parts: "single",
    };
  }

  // Select Dropdown
  if (type === "select" && constraints.options && constraints.options.length > 0) {
    const validOptions = constraints.options.filter((o) => o.value !== "");
    return {
      type: "QuestionChoice",
      prompt:
        lang === "hi"
          ? `कृपया ${accessibleName} का चयन करें:`
          : `Please choose your ${accessibleName}:`,
      hint: lang === "hi" ? "नीचे दिए गए विकल्पों में से एक चुनें" : "Select one of the options below",
      options: validOptions.map((o) => ({
        value: o.value,
        label: translateOptionLabel(o.label, lang),
      })),
      display: validOptions.length <= 5 ? "buttons" : "list",
    };
  }

  // Checkbox (Consent / Declaration)
  if (field.role === "checkbox") {
    return {
      type: "QuestionConsent",
      prompt: lang === "hi" ? "आधिकारिक घोषणा की पुष्टि करें" : "Declaration & Terms",
      statement: accessibleName,
      hint: lang === "hi" ? "आगे बढ़ने के लिए इस बॉक्स को चुनें" : "Check this box to confirm and continue",
    };
  }

  // Aadhaar / National ID special digit formatting
  if (sensitivity === "national_id") {
    return {
      type: "QuestionText",
      prompt:
        lang === "hi"
          ? "कृपया अपना 12 अंकों का आधार नंबर बोलें या लिखें:"
          : "Please enter your 12-digit Aadhaar / ID number:",
      hint:
        lang === "hi"
          ? "यह आपके आधिकारिक पहचान पत्र पर 12 अंकों में लिखा है"
          : "12 digits as printed on your national identity card",
      inputMode: "numeric",
      speakAs: "digit_groups",
      groupSize: 4,
      placeholder: "1234 5678 9012",
    };
  }

  // Default Text / Tel / Number Input
  const isNumber = type === "number" || /amount|pension|pincode|salary/i.test(accessibleName);
  const isTel = type === "tel" || /mobile|phone/i.test(accessibleName);

  return {
    type: "QuestionText",
    prompt:
      lang === "hi"
        ? `कृपया अपना ${accessibleName} दर्ज करें:`
        : `Please enter your ${accessibleName}:`,
    hint: field.description || (lang === "hi" ? "स्पष्ट अक्षरों में लिखें या माइक से बोलें" : "Type clearly or use voice input"),
    inputMode: isNumber ? "numeric" : isTel ? "tel" : "text",
    speakAs: isNumber || isTel ? "digit_groups" : "plain",
    groupSize: isTel ? 5 : undefined,
    placeholder: isTel ? "98765 43210" : undefined,
  };
}

function getFriendlyStepTitle(field: FieldSnapshot, lang: string, index: number): string {
  if (lang === "hi") {
    if (field.sensitivity === "national_id") return "आपका आधार नंबर";
    if (field.sensitivity === "date_of_birth") return "आपकी जन्मतिथि";
    if (field.role === "checkbox") return "घोषणा एवं सहमति";
    return field.accessibleName;
  }
  return field.accessibleName;
}

function translateOptionLabel(label: string, lang: string): string {
  if (lang !== "hi") return label;
  const dict: Record<string, string> = {
    Female: "महिला (Female)",
    Male: "पुरुष (Male)",
    "Transgender / Other": "अन्य (Other)",
    "Central Civil Superannuation Pension": "केंद्रीय सिविल अधिवार्षिकी पेंशन",
    "Family Pension (Spouse/Dependent)": "पारिवारिक पेंशन (पति/पत्नी/आश्रित)",
    "Disability / Extraordinary Pension": "दिव्यांगता पेंशन",
    "Defence Services Armed Forces Pension": "सशस्त्र सेना रक्षा पेंशन",
  };
  return dict[label] || label;
}

function translateColumnLabel(label: string, lang: string): string {
  if (lang !== "hi") return label;
  const dict: Record<string, string> = {
    Date: "दिनांक",
    "Transaction Details & Narration": "विवरण / प्रयोजन",
    "Reference / UTR": "संदर्भ संख्या",
    Category: "श्रेणी",
    "Debit (₹)": "निकासी / खर्च (₹)",
    "Credit (₹)": "जमा (₹)",
    "Closing Balance (₹)": "शेष राशि (₹)",
  };
  return dict[label] || label;
}
