export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी" },
  { code: "ta", label: "Tamil", nativeLabel: "தமிழ்" },
  { code: "te", label: "Telugu", nativeLabel: "తెలుగు" },
  { code: "bn", label: "Bengali", nativeLabel: "বাংলা" },
  { code: "mr", label: "Marathi", nativeLabel: "मराठी" },
] as const;

export const TEXT_SIZE_CLASSES = {
  large: {
    body: "text-lg leading-relaxed",
    heading: "text-2xl font-bold",
    title: "text-3xl font-extrabold",
    button: "text-lg py-3 px-6 min-h-[48px]",
    input: "text-xl py-3 px-4 min-h-[52px]",
  },
  larger: {
    body: "text-xl leading-relaxed",
    heading: "text-3xl font-bold",
    title: "text-4xl font-extrabold",
    button: "text-xl py-4 px-8 min-h-[56px]",
    input: "text-2xl py-4 px-5 min-h-[60px]",
  },
  largest: {
    body: "text-2xl leading-loose",
    heading: "text-4xl font-extrabold",
    title: "text-5xl font-black",
    button: "text-2xl py-5 px-10 min-h-[64px]",
    input: "text-3xl py-5 px-6 min-h-[68px]",
  },
} as const;

export const CONTRAST_THEMES = {
  standard: {
    bg: "bg-slate-50",
    surface: "bg-white",
    textPrimary: "text-slate-900",
    textSecondary: "text-slate-700",
    border: "border-slate-300",
    accent: "bg-blue-700 hover:bg-blue-800 text-white",
    focusRing: "focus:ring-4 focus:ring-blue-600 focus:outline-none",
    cardBg: "bg-white shadow-md border border-slate-200",
  },
  high: {
    bg: "bg-black",
    surface: "bg-black",
    textPrimary: "text-yellow-300",
    textSecondary: "text-white",
    border: "border-yellow-400 border-2",
    accent: "bg-yellow-400 hover:bg-yellow-300 text-black font-black",
    focusRing: "focus:ring-4 focus:ring-yellow-300 focus:outline-none",
    cardBg: "bg-neutral-900 border-2 border-yellow-400",
  },
} as const;

export const SENSITIVE_INPUT_TYPES = new Set([
  "password",
  "hidden",
]);

export const SENSITIVE_KEYWORDS = [
  "password",
  "passwd",
  "otp",
  "pin",
  "cvv",
  "cvc",
  "secret",
  "token",
];
