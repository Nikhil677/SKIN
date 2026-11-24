import React, { useState } from "react";
import { GovernmentForm } from "./pages/GovernmentForm";
import { BankDashboard } from "./pages/BankDashboard";
import { FileSpreadsheet, Landmark, Sparkles, ExternalLink, HelpCircle } from "lucide-react";

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"pension" | "banking">("pension");

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Demo Navigation Bar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow">
              S
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-wide bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                SKIN — Host Demo Portal
              </span>
              <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono">
                System of Record
              </span>
            </div>
          </div>

          {/* Scenario Switcher Tabs */}
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
            <button
              onClick={() => setActiveTab("pension")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === "pension"
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-300 hover:text-white hover:bg-slate-700"
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Scenario A: Pension Form
            </button>

            <button
              onClick={() => setActiveTab("banking")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === "banking"
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-300 hover:text-white hover:bg-slate-700"
              }`}
            >
              <Landmark className="w-3.5 h-3.5" />
              Scenario B: Bank Statement
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-300">
            <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400">
              <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
              <span>Click Skin extension icon in Chrome toolbar to transform</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Host Page Content */}
      <main className="flex-1 p-4 md:p-6">
        {activeTab === "pension" ? <GovernmentForm /> : <BankDashboard />}
      </main>

      {/* Footer */}
      <footer className="bg-slate-200 border-t border-slate-300 py-3 text-center text-xs text-slate-500">
        SKIN Hackathon MVP Demonstration Testbed • Synthetic Test Data Only • Original Webpage Remains System of Record
      </footer>
    </div>
  );
};
