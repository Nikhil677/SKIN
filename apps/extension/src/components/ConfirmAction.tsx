import React from "react";
import { Profile, TEXT_SIZE_CLASSES, getI18n } from "@skin/shared";
import { ShieldCheck, AlertTriangle } from "lucide-react";

interface ConfirmActionProps {
  consequence: string;
  confirmLabel: string;
  cancelLabel: string;
  profile: Profile;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmAction: React.FC<ConfirmActionProps> = ({
  consequence,
  confirmLabel,
  cancelLabel,
  profile,
  onConfirm,
  onCancel,
}) => {
  const strings = getI18n(profile.language);
  const sizeConfig = TEXT_SIZE_CLASSES[profile.textSize];

  return (
    <div className="space-y-6 text-center max-w-xl mx-auto py-4">
      <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-2 border-2 border-amber-300">
        <ShieldCheck className="w-9 h-9" />
      </div>

      <h3 className={`font-black text-slate-900 ${sizeConfig.heading}`}>
        Ready to Submit Application
      </h3>

      <div className="p-5 bg-amber-50 border-2 border-amber-300 rounded-2xl text-amber-950 text-left">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm font-semibold leading-relaxed">{consequence}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
        <button
          onClick={onCancel}
          className={`rounded-xl border-2 border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold ${sizeConfig.button}`}
        >
          {cancelLabel || strings.cancel}
        </button>

        <button
          onClick={onConfirm}
          className={`rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-lg ${sizeConfig.button}`}
        >
          {confirmLabel || strings.submitConfirm}
        </button>
      </div>
    </div>
  );
};
