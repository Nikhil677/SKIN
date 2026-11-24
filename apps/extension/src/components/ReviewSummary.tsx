import React from "react";
import { Profile, TEXT_SIZE_CLASSES, getI18n } from "@skin/shared";
import { Edit2 } from "lucide-react";

interface AnswerItem {
  stepIndex: number;
  label: string;
  value: string;
}

interface ReviewSummaryProps {
  answers: AnswerItem[];
  profile: Profile;
  onEditStep: (stepIndex: number) => void;
}

export const ReviewSummary: React.FC<ReviewSummaryProps> = ({ answers, profile, onEditStep }) => {
  const strings = getI18n(profile.language);
  const sizeConfig = TEXT_SIZE_CLASSES[profile.textSize];

  return (
    <div className="space-y-6">
      <p className="text-base text-slate-600 bg-blue-50 border border-blue-200 p-4 rounded-xl">
        All the information below has been saved to the portal. Please verify before the final submission.
      </p>

      <div className="divide-y divide-slate-200 border border-slate-300 rounded-2xl bg-white overflow-hidden shadow-sm">
        {answers.map((item) => (
          <div key={item.stepIndex} className="p-5 flex items-center justify-between gap-4 hover:bg-slate-50">
            <div>
              <span className="text-xs uppercase font-bold text-slate-500 tracking-wide block">
                {item.label}
              </span>
              <p className={`font-extrabold text-slate-900 mt-0.5 ${sizeConfig.body}`}>
                {item.value || <span className="text-slate-400 font-normal italic">Not answered</span>}
              </p>
            </div>

            <button
              onClick={() => onEditStep(item.stepIndex)}
              className="px-4 py-2 rounded-lg border-2 border-slate-300 bg-white hover:bg-slate-100 text-blue-700 font-bold text-sm flex items-center gap-1.5 shadow-sm shrink-0"
            >
              <Edit2 className="w-4 h-4" />
              {strings.edit}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
