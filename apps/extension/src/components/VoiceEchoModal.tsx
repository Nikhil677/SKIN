import React from "react";
import { Profile, getI18n, TEXT_SIZE_CLASSES } from "@skin/shared";
import { Mic, CheckCircle2, RotateCcw } from "lucide-react";

interface VoiceEchoModalProps {
  recognizedText: string;
  profile: Profile;
  onConfirm: () => void;
  onRetry: () => void;
}

export const VoiceEchoModal: React.FC<VoiceEchoModalProps> = ({
  recognizedText,
  profile,
  onConfirm,
  onRetry,
}) => {
  const strings = getI18n(profile.language);
  const sizeConfig = TEXT_SIZE_CLASSES[profile.textSize];

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Confirm Voice Input"
    >
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border-4 border-blue-500 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
          <Mic className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">
            Voice Recognition Result
          </span>
          <p className={`font-black text-slate-900 mt-2 font-mono p-4 bg-slate-100 rounded-2xl border border-slate-300 ${sizeConfig.heading}`}>
            "{recognizedText}"
          </p>
        </div>

        <p className="text-base text-slate-600 font-semibold">
          {strings.voiceEchoConfirm.replace("{value}", recognizedText)}
        </p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={onRetry}
            className="px-5 py-3 rounded-xl border-2 border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-base flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            {strings.tryAgain}
          </button>

          <button
            onClick={onConfirm}
            className="px-7 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base flex items-center gap-2 shadow-lg"
          >
            <CheckCircle2 className="w-5 h-5" />
            {strings.yesCorrect}
          </button>
        </div>
      </div>
    </div>
  );
};
