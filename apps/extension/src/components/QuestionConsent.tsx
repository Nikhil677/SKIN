import React from "react";
import { Profile, TEXT_SIZE_CLASSES } from "@skin/shared";
import { Check } from "lucide-react";

interface QuestionConsentProps {
  prompt: string;
  statement: string;
  hint?: string;
  checked: boolean;
  error?: string;
  profile: Profile;
  onChange: (checked: boolean) => void;
}

export const QuestionConsent: React.FC<QuestionConsentProps> = ({
  prompt,
  statement,
  hint,
  checked,
  error,
  profile,
  onChange,
}) => {
  const sizeConfig = TEXT_SIZE_CLASSES[profile.textSize];

  return (
    <div className="space-y-4">
      <h3 className={`font-bold text-slate-800 ${sizeConfig.body}`}>{prompt}</h3>

      {hint && <p className="text-base text-slate-600 bg-slate-100 p-3 rounded-lg border border-slate-200">{hint}</p>}

      <div
        onClick={() => onChange(!checked)}
        className={`p-6 rounded-2xl border-3 cursor-pointer transition-all flex items-start gap-4 ${
          checked
            ? "border-emerald-600 bg-emerald-50 text-emerald-950 ring-4 ring-emerald-100 shadow-sm"
            : "border-slate-300 bg-white hover:bg-slate-50 text-slate-800"
        }`}
        role="checkbox"
        aria-checked={checked}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            onChange(!checked);
          }
        }}
      >
        <div
          className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center shrink-0 mt-1 transition-colors ${
            checked ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-400 bg-white"
          }`}
        >
          {checked && <Check className="w-5 h-5 stroke-[3]" />}
        </div>
        <p className={`font-semibold leading-relaxed ${sizeConfig.body}`}>{statement}</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-300 text-red-700 rounded-lg text-sm font-semibold">
          <span>⚠️ {error}</span>
        </div>
      )}
    </div>
  );
};
