import React from "react";
import { Profile, SUPPORTED_LANGUAGES, getI18n } from "@skin/shared";
import { Volume2, VolumeX, Eye, Sparkles, X, Languages } from "lucide-react";

interface ProgressHeaderProps {
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
  profile: Profile;
  onUpdateProfile: (updated: Partial<Profile>) => void;
  onExit: () => void;
}

export const ProgressHeader: React.FC<ProgressHeaderProps> = ({
  currentStep,
  totalSteps,
  stepTitle,
  profile,
  onUpdateProfile,
  onExit,
}) => {
  const strings = getI18n(profile.language);
  const progressPercent = Math.min(100, Math.round((currentStep / totalSteps) * 100));

  return (
    <header className="border-b pb-4 mb-6" role="banner">
      {/* Top Status & Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        {/* Step Indicator */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow">
            {currentStep}
          </div>
          <span className="font-bold text-lg text-slate-800">
            {strings.step} {currentStep} {strings.of} {totalSteps}
          </span>
        </div>

        {/* Accessibility & Personalization Toolbar */}
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-300">
            <Languages className="w-4 h-4 text-slate-600 ml-1" />
            <select
              value={profile.language}
              onChange={(e) => onUpdateProfile({ language: e.target.value as any })}
              className="bg-transparent text-sm font-semibold text-slate-800 p-1 focus:outline-none cursor-pointer"
              aria-label="Select Language"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.nativeLabel} ({lang.label})
                </option>
              ))}
            </select>
          </div>

          {/* Text Size Presets */}
          <div className="flex items-center border border-slate-300 rounded-lg p-0.5 bg-slate-100">
            <button
              onClick={() => onUpdateProfile({ textSize: "large" })}
              className={`px-2 py-1 text-xs font-bold rounded ${
                profile.textSize === "large" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600"
              }`}
              title="Large Text"
            >
              A
            </button>
            <button
              onClick={() => onUpdateProfile({ textSize: "larger" })}
              className={`px-2.5 py-1 text-sm font-black rounded ${
                profile.textSize === "larger" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600"
              }`}
              title="Larger Text"
            >
              A+
            </button>
            <button
              onClick={() => onUpdateProfile({ textSize: "largest" })}
              className={`px-3 py-1 text-base font-black rounded ${
                profile.textSize === "largest" ? "bg-white text-blue-700 shadow-sm" : "text-slate-600"
              }`}
              title="Largest Text"
            >
              A++
            </button>
          </div>

          {/* Contrast Mode Toggle */}
          <button
            onClick={() =>
              onUpdateProfile({ contrast: profile.contrast === "high" ? "standard" : "high" })
            }
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 ${
              profile.contrast === "high"
                ? "bg-yellow-400 text-black border-yellow-500 font-black"
                : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
            }`}
            title="Toggle High Contrast"
          >
            <Eye className="w-3.5 h-3.5" />
            {profile.contrast === "high" ? "High Contrast" : "Contrast"}
          </button>

          {/* Voice Output Toggle */}
          <button
            onClick={() => onUpdateProfile({ voiceOutput: !profile.voiceOutput })}
            className={`p-1.5 rounded-lg border text-xs font-bold ${
              profile.voiceOutput
                ? "bg-blue-50 text-blue-700 border-blue-300"
                : "bg-slate-100 text-slate-500 border-slate-300"
            }`}
            title={profile.voiceOutput ? "Voice Read-Aloud Active" : "Voice Read-Aloud Off"}
          >
            {profile.voiceOutput ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Exit / Return to Original */}
          <button
            onClick={onExit}
            className="p-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-200 transition-colors ml-1"
            title={strings.useOriginalPage}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
        <div
          className="bg-blue-600 h-full transition-all duration-300 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Step Heading */}
      <h2 className="mt-4 text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
        {stepTitle}
      </h2>
    </header>
  );
};
