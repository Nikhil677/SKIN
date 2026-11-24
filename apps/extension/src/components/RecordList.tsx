import React, { useState, useMemo } from "react";
import { Profile, TEXT_SIZE_CLASSES, TableSnapshot, getI18n } from "@skin/shared";
import { Search, ArrowUpRight, ArrowDownLeft, Sparkles, Filter, Check } from "lucide-react";

interface RecordListProps {
  tableSnapshot: TableSnapshot;
  profile: Profile;
  onSelectRecord?: (recordRef: string) => void;
}

export const RecordList: React.FC<RecordListProps> = ({ tableSnapshot, profile }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "DEBIT" | "CREDIT">("ALL");
  const [highlightedRowRef, setHighlightedRowRef] = useState<string | null>(null);

  const strings = getI18n(profile.language);
  const sizeConfig = TEXT_SIZE_CLASSES[profile.textSize];

  const processedRows = useMemo(() => {
    return tableSnapshot.rows.filter((row) => {
      const cellsText = Object.values(row.cells).join(" ").toLowerCase();
      const matchesSearch = cellsText.includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;
      if (typeFilter === "DEBIT" && !cellsText.includes("debit") && !cellsText.includes("dr")) return false;
      if (typeFilter === "CREDIT" && !cellsText.includes("credit") && !cellsText.includes("cr")) return false;

      return true;
    });
  }, [tableSnapshot.rows, searchQuery, typeFilter]);

  // Voice Query resolver for Imran persona ("largest debit", "latest credit", etc.)
  const handleVoiceQuery = (query: string) => {
    setSearchQuery(query);
    const lower = query.toLowerCase();

    if (lower.includes("largest debit") || lower.includes("biggest debit") || lower.includes("सबसे बड़ा खर्च")) {
      // Find row with max debit
      let maxDebit = 0;
      let targetRef: string | null = null;
      tableSnapshot.rows.forEach((r) => {
        const text = Object.values(r.cells).join(" ");
        if (/debit/i.test(text)) {
          const match = text.match(/₹?\s*([\d,]+(\.\d+)?)/);
          if (match) {
            const val = parseFloat(match[1].replace(/,/g, ""));
            if (val > maxDebit) {
              maxDebit = val;
              targetRef = r.ref;
            }
          }
        }
      });
      if (targetRef) setHighlightedRowRef(targetRef);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Voice Filter Pills */}
      <div className="bg-slate-100 p-4 rounded-2xl border border-slate-300 space-y-3">
        <div className="relative">
          <Search className="w-6 h-6 absolute left-4 top-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={strings.searchPlaceholder}
            className={`w-full pl-13 pr-4 rounded-xl border-2 border-slate-300 bg-white font-semibold focus:outline-none focus:border-blue-600 ${sizeConfig.body} py-3`}
          />
        </div>

        {/* Quick Voice / Filter Shortcuts */}
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={() => {
              setTypeFilter("ALL");
              setSearchQuery("");
              setHighlightedRowRef(null);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
              typeFilter === "ALL" && !searchQuery ? "bg-blue-600 text-white" : "bg-white text-slate-700 border"
            }`}
          >
            {strings.allRecords}
          </button>
          <button
            onClick={() => handleVoiceQuery("largest debit")}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-50 text-rose-800 border border-rose-300 hover:bg-rose-100 flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-600" />
            {strings.largestDebit}
          </button>
          <button
            onClick={() => setTypeFilter("CREDIT")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
              typeFilter === "CREDIT" ? "bg-emerald-600 text-white" : "bg-white text-slate-700 border"
            }`}
          >
            {strings.largestCredit}
          </button>
        </div>
      </div>

      {/* Simplified Large Cards Feed */}
      <div className="space-y-4" role="list">
        {processedRows.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 border rounded-2xl text-slate-500 font-bold">
            No transaction records match your search query.
          </div>
        ) : (
          processedRows.map((row) => {
            const isHighlighted = highlightedRowRef === row.ref;
            const values = Object.values(row.cells);
            const date = values[0] || "";
            const narration = values[1] || "";
            const type = values[2] || "";
            const amount = values[4] !== "-" && values[4] ? values[4] : values[5] || values[3] || "";
            const isDebit = /debit/i.test(type) || values.some((v) => /debit/i.test(v));

            return (
              <div
                key={row.ref}
                role="listitem"
                className={`p-6 rounded-2xl border-3 transition-all ${
                  isHighlighted
                    ? "border-yellow-500 bg-yellow-50/50 ring-4 ring-yellow-200 shadow-lg"
                    : "border-slate-200 bg-white hover:border-slate-300 shadow-sm"
                }`}
              >
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-[240px]">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                        isDebit ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {isDebit ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownLeft className="w-6 h-6" />}
                    </div>

                    <div>
                      <span className="font-mono text-sm text-slate-500 block font-semibold">{date}</span>
                      <h4 className={`font-extrabold text-slate-900 leading-snug mt-1 ${sizeConfig.body}`}>
                        {narration}
                      </h4>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 mt-2 inline-block">
                        {isDebit ? "Money Paid Out (Debit)" : "Money Received (Credit)"}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`font-mono font-black text-2xl md:text-3xl block ${
                        isDebit ? "text-rose-700" : "text-emerald-700"
                      }`}
                    >
                      {isDebit ? `- ${amount}` : `+ ${amount}`}
                    </span>
                    {values[6] && (
                      <span className="text-xs font-mono text-slate-500 block mt-1">
                        Balance: {values[6]}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
