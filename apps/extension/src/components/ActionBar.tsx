import React from "react";
import { Profile, getI18n, TEXT_SIZE_CLASSES } from "@skin/shared";
import { ArrowLeft, ArrowRight, Mic, Volume2, Eye } from "lucide-react";

interface ActionBarProps {
  currentStep: number;
  totalSteps: number;
  profile: Profile;
  canGoBack: boolean;
  canGoNext: boolean;
  isNextSubmit?: boolean;
  isListening?: boolean;
  onBack: () => void;
  onNext: () => void;
  onReadAloud: () => void;
  onToggleVoiceInput: () => void;
  onShowOriginal: () => void;
}

export const ActionBar: React.FC<ActionBarProps> = ({
  currentStep,
  totalSteps,
  profile,
  canGoBack,
  canGoNext,
  isNextSubmit,
  isListening,
  onBack,
  onNext,
  onReadAloud,
  onToggleVoiceInput,
  onShowOriginal,
}) => {
  const strings = getI18n(profile.language);
  const sizeConfig = TEXT_SIZE_CLASSES[profile.textSize];

  return (
    <footer
      className="mt-8 pt-6 border-t border-slate-200 flex flex-wrap gap-4 items-center justify-between"
      role="navigation"
      aria-label="Navigation Controls"
    >
      <div className="flex items-center gap-3">
        {canGoBack && (
          <button
            onClick={onBack}
            className={`rounded-xl border-2 border-slate-300 bg-white hover:bg-slate-100 text-slate-800 font-bold flex items-center gap-2 shadow-sm transition-transform active:scale-95 ${sizeConfig.button}`}
          >
            <ArrowLeft className="w-6 h-6" />
            {strings.back}
          </button>
        )}

        <button
          onClick={onShowOriginal}
          className="px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-semibold flex items-center gap-1.5 transition-colors"
        >
          <Eye className="w-4 h-4" />
          {strings.showOriginal}
        </button>
      </div>

      <div className="flex items-center gap-3">
        {/* Read Aloud Button */}
        <button
          onClick={onReadAloud}
          className="px-4 py-3 rounded-xl border-2 border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-bold flex items-center gap-2 text-sm shadow-sm transition-colors"
          title={strings.readAloud}
        >
          <Volume2 className="w-5 h-5 text-indigo-700" />
          {strings.readAloud}
        </button>

        {/* Speak Answer (Voice Input) Button */}
        <button
          onClick={onToggleVoiceInput}
          className={`px-5 py-3 rounded-xl border-2 font-bold flex items-center gap-2 text-sm shadow-sm transition-all ${
            isListening
              ? "bg-rose-600 text-white border-rose-700 animate-pulse"
              : "bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100"
          }`}
          title={isListening ? strings.stopListening : strings.speak}
        >
          <Mic className={`w-5 h-5 ${isListening ? "text-white" : "text-emerald-700"}`} />
          {isListening ? strings.listening : strings.speak}
        </button>

        {/* Next / Submit Button */}
        <button
          onClick={onNext}
          disabled={!canGoNext}
          className={`rounded-xl font-black flex items-center gap-2 shadow-lg transition-transform active:scale-95 ${sizeConfig.button} ${
            isNextSubmit
              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          } ${!canGoNext ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isNextSubmit ? strings.submitConfirm : strings.next}
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    </footer>
  );
};
