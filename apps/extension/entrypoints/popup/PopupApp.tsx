import React, { useState, useEffect } from "react";
import { Profile, DEFAULT_PROFILE, SUPPORTED_LANGUAGES } from "@skin/shared";
import { loadUserProfile, saveUserProfile } from "../../src/profile/storage";
import { Sparkles, Languages, Eye, Volume2, Shield } from "lucide-react";

export const PopupApp: React.FC = () => {
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);

  useEffect(() => {
    loadUserProfile().then((p) => setProfile(p));
  }, []);

  const handleUpdate = (updated: Partial<Profile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...updated };
      saveUserProfile(next);
      return next;
    });
  };

  const handleActivateOnTab = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        await chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_SKIN" });
        window.close();
      }
    } catch {
      alert("Please navigate to a webpage to activate SKIN.");
    }
  };

  return (
    <div className="space-y-4">
      {/* Extension Header */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black flex items-center justify-center text-lg shadow">
          S
        </div>
        <div>
          <h1 className="font-extrabold text-base text-slate-900 leading-tight">SKIN</h1>
          <p className="text-[11px] text-slate-500 font-medium">Adaptive Web Accessibility</p>
        </div>
      </div>

      {/* Primary Activation Button */}
      <button
        onClick={handleActivateOnTab}
        className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95"
      >
        <Sparkles className="w-4 h-4" />
        Activate SKIN on this Page
      </button>

      {/* Preferences Section */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-3 text-xs">
        <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
          Quick Preferences
        </div>

        {/* Language */}
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-700 flex items-center gap-1.5">
            <Languages className="w-3.5 h-3.5 text-slate-500" />
            Language
          </span>
          <select
            value={profile.language}
            onChange={(e) => handleUpdate({ language: e.target.value as any })}
            className="p-1 border border-slate-300 rounded font-semibold text-slate-800 bg-slate-50"
          >
            {SUPPORTED_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.nativeLabel}
              </option>
            ))}
          </select>
        </div>

        {/* Text Size */}
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-700">Text Size</span>
          <div className="flex gap-1">
            {(["large", "larger", "largest"] as const).map((size) => (
              <button
                key={size}
                onClick={() => handleUpdate({ textSize: size })}
                className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                  profile.textSize === size ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {size === "large" ? "A" : size === "larger" ? "A+" : "A++"}
              </button>
            ))}
          </div>
        </div>

        {/* Contrast */}
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-700 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            High Contrast
          </span>
          <input
            type="checkbox"
            checked={profile.contrast === "high"}
            onChange={(e) => handleUpdate({ contrast: e.target.checked ? "high" : "standard" })}
            className="rounded border-slate-300 text-blue-600"
          />
        </div>

        {/* Voice Read-Aloud */}
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-700 flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-slate-500" />
            Read Questions Aloud
          </span>
          <input
            type="checkbox"
            checked={profile.voiceOutput}
            onChange={(e) => handleUpdate({ voiceOutput: e.target.checked })}
            className="rounded border-slate-300 text-blue-600"
          />
        </div>
      </div>

      <div className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
        <Shield className="w-3 h-3" />
        <span>Safe & Private • Sensitive values stay local</span>
      </div>
    </div>
  );
};
