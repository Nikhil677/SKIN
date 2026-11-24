import React from "react";
import { Profile, TEXT_SIZE_CLASSES } from "@skin/shared";
import { CheckCircle2 } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface QuestionChoiceProps {
  prompt: string;
  hint?: string;
  options: Option[];
  value: string;
  error?: string;
  profile: Profile;
  onChange: (value: string) => void;
}

export const QuestionChoice: React.FC<QuestionChoiceProps> = ({
  prompt,
  hint,
  options,
  value,
  error,
  profile,
  onChange,
}) => {
  const sizeConfig = TEXT_SIZE_CLASSES[profile.textSize];

  return (
    <div className="space-y-4">
      <label className={`block font-bold text-slate-800 ${sizeConfig.body}`}>{prompt}</label>

      {hint && <p className="text-base text-slate-600 bg-slate-100 p-3 rounded-lg border border-slate-200">{hint}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3" role="radiogroup">
        {options.map((opt) => {
          const isSelected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(opt.value)}
              className={`p-5 rounded-2xl border-3 text-left font-bold transition-all flex items-center justify-between ${
                isSelected
                  ? "border-blue-600 bg-blue-50 text-blue-900 shadow-md ring-4 ring-blue-100"
                  : "border-slate-300 bg-white hover:bg-slate-50 text-slate-800"
              }`}
            >
              <span className={sizeConfig.body}>{opt.label}</span>
              {isSelected && <CheckCircle2 className="w-6 h-6 text-blue-600 shrink-0 ml-3" />}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-300 text-red-700 rounded-lg text-sm font-semibold">
          <span>⚠️ {error}</span>
        </div>
      )}
    </div>
  );
};
