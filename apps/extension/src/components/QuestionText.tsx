import React from "react";
import { Profile, TEXT_SIZE_CLASSES } from "@skin/shared";

interface QuestionTextProps {
  prompt: string;
  hint?: string;
  value: string;
  inputMode?: "text" | "numeric" | "tel" | "email";
  speakAs?: "plain" | "digit_groups" | "spell";
  placeholder?: string;
  error?: string;
  profile: Profile;
  onChange: (value: string) => void;
}

export const QuestionText: React.FC<QuestionTextProps> = ({
  prompt,
  hint,
  value,
  inputMode = "text",
  placeholder,
  error,
  profile,
  onChange,
}) => {
  const sizeConfig = TEXT_SIZE_CLASSES[profile.textSize];

  return (
    <div className="space-y-4">
      <label htmlFor="skin-text-input" className={`block font-bold text-slate-800 ${sizeConfig.body}`}>
        {prompt}
      </label>

      {hint && <p className="text-base text-slate-600 bg-slate-100 p-3 rounded-lg border border-slate-200">{hint}</p>}

      <input
        id="skin-text-input"
        type={inputMode === "numeric" ? "text" : inputMode === "tel" ? "tel" : "text"}
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Type your answer..."}
        autoFocus
        className={`w-full rounded-xl border-2 font-mono shadow-inner transition-colors ${sizeConfig.input} ${
          error ? "border-red-500 bg-red-50/20" : "border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
        }`}
      />

      {error && (
        <div className="p-3 bg-red-50 border border-red-300 text-red-700 rounded-lg text-sm font-semibold flex items-center gap-2">
          <span>⚠️ {error}</span>
        </div>
      )}
    </div>
  );
};
