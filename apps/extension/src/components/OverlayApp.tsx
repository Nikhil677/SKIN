import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  PageSnapshot,
  TaskModel,
  UISpec,
  Profile,
  DEFAULT_PROFILE,
  CONTRAST_THEMES,
  generateDeterministicUISpec,
  ElementRegistry,
  ActionBridge,
  defaultElementRegistry,
} from "@skin/shared";
import { ProgressHeader } from "./ProgressHeader";
import { ActionBar } from "./ActionBar";
import { QuestionText } from "./QuestionText";
import { QuestionDate } from "./QuestionDate";
import { QuestionChoice } from "./QuestionChoice";
import { QuestionConsent } from "./QuestionConsent";
import { RecordList } from "./RecordList";
import { ReviewSummary } from "./ReviewSummary";
import { ConfirmAction } from "./ConfirmAction";
import { VoiceEchoModal } from "./VoiceEchoModal";
import { VoiceService } from "../voice/speech";
import { loadUserProfile, saveUserProfile } from "../profile/storage";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

interface OverlayAppProps {
  initialSnapshot: PageSnapshot;
  taskModel: TaskModel;
  registry?: ElementRegistry;
  bridge?: ActionBridge;
  onExit: () => void;
}

export const OverlayApp: React.FC<OverlayAppProps> = ({
  initialSnapshot,
  taskModel,
  registry = defaultElementRegistry,
  bridge = new ActionBridge({ registry }),
  onExit,
}) => {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [currentStepIndex, setCurrentStepIndex] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string | boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isListening, setIsListening] = useState(false);
  const [voiceEchoCandidate, setVoiceEchoCandidate] = useState<string | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [activeVoiceStopFn, setActiveVoiceStopFn] = useState<(() => void) | null>(null);

  // Load saved user profile
  useEffect(() => {
    loadUserProfile().then((p) => setProfile(p));
  }, []);

  const handleUpdateProfile = (updated: Partial<Profile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...updated };
      saveUserProfile(next);
      return next;
    });
  };

  // Generate UI Spec based on current profile language
  const uiSpec: UISpec = useMemo(() => {
    return generateDeterministicUISpec(initialSnapshot, taskModel, profile);
  }, [initialSnapshot, taskModel, profile]);

  const currentStep = uiSpec.steps[currentStepIndex - 1] || uiSpec.steps[0];
  const totalSteps = uiSpec.steps.length;

  // Initialize answers from initial snapshot fields
  useEffect(() => {
    const initialValues: Record<string, string | boolean> = {};
    initialSnapshot.fields.forEach((f) => {
      if (f.state.currentValue) {
        initialValues[f.ref] = f.state.currentValue;
      }
      if (f.role === "checkbox") {
        initialValues[f.ref] = f.state.checked || false;
      }
    });
    setAnswers((prev) => ({ ...initialValues, ...prev }));
  }, [initialSnapshot]);

  // Read prompt aloud on step change if autoReadAloud is enabled
  useEffect(() => {
    if (profile.autoReadAloud && profile.voiceOutput && !showOriginal && !submittedSuccess) {
      const promptToRead = getStepPromptText(currentStep);
      if (promptToRead) {
        const timer = setTimeout(() => {
          VoiceService.speak(promptToRead, profile.language, profile.speechRate);
        }, 300);
        return () => {
          clearTimeout(timer);
          VoiceService.stopSpeaking();
        };
      }
    }
  }, [currentStepIndex, profile.language, profile.autoReadAloud, profile.voiceOutput, showOriginal, submittedSuccess]);

  // Current field reference and current value
  const currentBinding = currentStep?.bindings[0];
  const currentFieldRef = currentBinding?.fieldRef;
  const currentAnswer = currentFieldRef ? answers[currentFieldRef] : "";

  // Step change handlers
  const handleAnswerChange = (val: string | boolean) => {
    if (!currentFieldRef) return;
    setAnswers((prev) => ({ ...prev, [currentFieldRef]: val }));
    if (errors[currentFieldRef]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[currentFieldRef];
        return copy;
      });
    }

    // Immediately synchronize to host DOM
    syncAnswerToHost(currentFieldRef, val);
  };

  const syncAnswerToHost = async (fieldRef: string, val: string | boolean) => {
    const field = initialSnapshot.fields.find((f) => f.ref === fieldRef);
    if (!field) return;

    if (field.role === "checkbox") {
      await bridge.execute({
        schemaVersion: "1.0",
        actionId: `act_${Date.now()}`,
        type: val ? "check" : "uncheck",
        fieldRef,
        value: Boolean(val),
        origin: "user_confirmed",
        requiresConfirmation: false,
      });
    } else if (field.type === "select") {
      await bridge.execute({
        schemaVersion: "1.0",
        actionId: `act_${Date.now()}`,
        type: "selectOption",
        fieldRef,
        value: String(val),
        origin: "user_confirmed",
        requiresConfirmation: false,
      });
    } else {
      await bridge.execute({
        schemaVersion: "1.0",
        actionId: `act_${Date.now()}`,
        type: "setValue",
        fieldRef,
        value: String(val),
        origin: "user_confirmed",
        requiresConfirmation: false,
      });
    }
  };

  const handleNext = async () => {
    // Validate current field if required
    if (currentStep.required && currentFieldRef) {
      const val = answers[currentFieldRef];
      if (!val || (typeof val === "string" && !val.trim())) {
        setErrors((prev) => ({ ...prev, [currentFieldRef]: "This question requires an answer to proceed." }));
        return;
      }
    }

    if (currentStepIndex < totalSteps) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 1) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleConfirmSubmit = async () => {
    if (taskModel.finalActionRef) {
      const res = await bridge.execute({
        schemaVersion: "1.0",
        actionId: `submit_${Date.now()}`,
        type: "click",
        fieldRef: taskModel.finalActionRef,
        origin: "user_confirmed",
        requiresConfirmation: true,
      });

      if (res.status === "ok") {
        setSubmittedSuccess(true);
        if (profile.voiceOutput) {
          VoiceService.speak("Your application has been successfully submitted.", profile.language);
        }
      }
    }
  };

  const handleReadAloud = () => {
    const prompt = getStepPromptText(currentStep);
    if (prompt) {
      VoiceService.speak(prompt, profile.language, profile.speechRate);
    }
  };

  const handleToggleVoiceInput = () => {
    if (isListening) {
      if (activeVoiceStopFn) activeVoiceStopFn();
      setIsListening(false);
      return;
    }

    setIsListening(true);
    const stopFn = VoiceService.listen(
      profile.language,
      (text, isFinal) => {
        if (isFinal) {
          setIsListening(false);
          setVoiceEchoCandidate(text);
          VoiceService.speak(`I heard: ${text}. Is this correct?`, profile.language);
        }
      },
      (err) => {
        setIsListening(false);
      }
    );
    setActiveVoiceStopFn(() => stopFn);
  };

  const handleConfirmVoiceCandidate = () => {
    if (voiceEchoCandidate && currentFieldRef) {
      handleAnswerChange(voiceEchoCandidate);
      setVoiceEchoCandidate(null);
    }
  };

  // Keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onExit();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onExit]);

  const theme = CONTRAST_THEMES[profile.contrast];

  // If user requested "Show Original Page", reduce opacity to 0 temporarily
  if (showOriginal) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setShowOriginal(false)}
          className="px-6 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-base shadow-2xl flex items-center gap-2 border-2 border-white ring-4 ring-blue-300"
        >
          Return to Simple SKIN View
        </button>
      </div>
    );
  }

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 md:p-8 backdrop-blur-md transition-all duration-300 ${
        profile.contrast === "high" ? "bg-black/95" : "bg-slate-900/80"
      }`}
      role="region"
      aria-label="Skin Adaptive Accessibility Interface"
    >
      <div
        className={`w-full max-w-3xl rounded-3xl p-6 md:p-10 shadow-2xl transition-all border-4 ${
          profile.contrast === "high"
            ? "bg-black border-yellow-400 text-yellow-300"
            : "bg-white border-slate-200 text-slate-800"
        }`}
      >
        {/* Header */}
        <ProgressHeader
          currentStep={currentStepIndex}
          totalSteps={totalSteps}
          stepTitle={currentStep.title}
          profile={profile}
          onUpdateProfile={handleUpdateProfile}
          onExit={onExit}
        />

        {/* Success Screen */}
        {submittedSuccess ? (
          <div className="text-center py-10 space-y-6">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto border-4 border-emerald-400">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h3 className="text-3xl font-black text-slate-900">Application Submitted!</h3>
            <p className="text-lg text-slate-700 max-w-md mx-auto">
              Your details have been successfully transmitted and verified on the official website.
            </p>
            <button
              onClick={onExit}
              className="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg"
            >
              Return to Website
            </button>
          </div>
        ) : (
          /* Step Component Rendering */
          <main className="min-h-[260px] flex flex-col justify-center">
            {renderComponent(
              currentStep,
              currentAnswer,
              errors[currentFieldRef || ""],
              profile,
              handleAnswerChange,
              initialSnapshot,
              (stepIdx) => setCurrentStepIndex(stepIdx),
              handleConfirmSubmit,
              handleBack
            )}
          </main>
        )}

        {/* Action Bar */}
        {!submittedSuccess && currentStep.component.type !== "ConfirmAction" && (
          <ActionBar
            currentStep={currentStepIndex}
            totalSteps={totalSteps}
            profile={profile}
            canGoBack={currentStepIndex > 1}
            canGoNext={true}
            isNextSubmit={currentStepIndex === totalSteps}
            isListening={isListening}
            onBack={handleBack}
            onNext={handleNext}
            onReadAloud={handleReadAloud}
            onToggleVoiceInput={handleToggleVoiceInput}
            onShowOriginal={() => setShowOriginal(true)}
          />
        )}

        {/* Voice Echo Confirmation Modal */}
        {voiceEchoCandidate && (
          <VoiceEchoModal
            recognizedText={voiceEchoCandidate}
            profile={profile}
            onConfirm={handleConfirmVoiceCandidate}
            onRetry={() => {
              setVoiceEchoCandidate(null);
              handleToggleVoiceInput();
            }}
          />
        )}
      </div>
    </div>
  );
};

function renderComponent(
  step: any,
  value: string | boolean,
  error: string | undefined,
  profile: Profile,
  onChange: (val: string | boolean) => void,
  snapshot: PageSnapshot,
  onEditStep: (idx: number) => void,
  onConfirm: () => void,
  onCancel: () => void
) {
  const comp = step.component;

  switch (comp.type) {
    case "QuestionText":
      return (
        <QuestionText
          prompt={comp.prompt}
          hint={comp.hint}
          value={String(value || "")}
          inputMode={comp.inputMode}
          speakAs={comp.speakAs}
          placeholder={comp.placeholder}
          error={error}
          profile={profile}
          onChange={onChange}
        />
      );

    case "QuestionDate":
      return (
        <QuestionDate
          prompt={comp.prompt}
          hint={comp.hint}
          value={String(value || "")}
          error={error}
          profile={profile}
          onChange={onChange}
        />
      );

    case "QuestionChoice":
      return (
        <QuestionChoice
          prompt={comp.prompt}
          hint={comp.hint}
          options={comp.options}
          value={String(value || "")}
          error={error}
          profile={profile}
          onChange={onChange}
        />
      );

    case "QuestionConsent":
      return (
        <QuestionConsent
          prompt={comp.prompt}
          statement={comp.statement}
          hint={comp.hint}
          checked={Boolean(value)}
          error={error}
          profile={profile}
          onChange={onChange}
        />
      );

    case "RecordList":
      return (
        <RecordList
          tableSnapshot={snapshot.tables[0] || { ref: "t_01", caption: "", columns: [], rows: [] }}
          profile={profile}
        />
      );

    case "ReviewSummary": {
      const summaryItems = snapshot.fields.map((f, idx) => ({
        stepIndex: idx + 1,
        label: f.accessibleName,
        value: String(f.state.currentValue || (f.role === "checkbox" ? (f.state.checked ? "Yes" : "No") : "")),
      }));
      return <ReviewSummary answers={summaryItems} profile={profile} onEditStep={onEditStep} />;
    }

    case "ConfirmAction":
      return (
        <ConfirmAction
          consequence={comp.consequence}
          confirmLabel={comp.confirmLabel}
          cancelLabel={comp.cancelLabel}
          profile={profile}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

    case "HandoffNotice":
      return (
        <div className="p-6 bg-amber-50 border-2 border-amber-300 rounded-2xl text-amber-950 space-y-3">
          <h4 className="font-bold text-lg">Official Website Action Required</h4>
          <p className="text-base">{comp.instruction}</p>
        </div>
      );

    default:
      return <div>{comp.prompt || "Please continue"}</div>;
  }
}

function getStepPromptText(step: any): string {
  if (!step || !step.component) return "";
  const comp = step.component;
  return comp.prompt || comp.statement || comp.title || step.title || "";
}
