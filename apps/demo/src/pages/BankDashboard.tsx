import React, { useState, useMemo } from "react";
import { MOCK_TRANSACTIONS, Transaction } from "../data/mockTransactions";
import { Search, Filter, Download, ArrowUpRight, ArrowDownLeft, Landmark, Calendar, RefreshCw } from "lucide-react";

export const BankDashboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "DEBIT" | "CREDIT">("ALL");

  const filteredTransactions = useMemo(() => {
    return MOCK_TRANSACTIONS.filter((tx) => {
      const matchesSearch =
        tx.narration.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.ref.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === "ALL" || tx.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [searchTerm, filterType]);

  const totalDebits = useMemo(() => {
    return MOCK_TRANSACTIONS.filter((t) => t.type === "DEBIT").reduce((acc, t) => acc + t.amount, 0);
  }, []);

  const totalCredits = useMemo(() => {
    return MOCK_TRANSACTIONS.filter((t) => t.type === "CREDIT").reduce((acc, t) => acc + t.amount, 0);
  }, []);

  return (
    <div className="max-w-5xl mx-auto my-6 bg-white border border-slate-300 shadow-md rounded text-xs font-sans text-slate-800">
      {/* Dense Banking Header */}
      <div className="bg-slate-900 text-white p-4 border-b-4 border-blue-600 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center">
            <Landmark className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-wide">Apex National Commercial Bank</h1>
            <p className="text-[10px] text-slate-400">NetBanking Online Financial Services Portal — e-Statement</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400">Primary Savings Account</span>
          <p className="font-mono font-bold text-sm text-emerald-400">A/C: 4092-8812-9901</p>
        </div>
      </div>

      {/* Account Balance Summary Cards */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-white p-3 border border-slate-200 rounded">
          <span className="text-[10px] text-slate-500 uppercase font-semibold">Available Clear Balance</span>
          <p className="text-lg font-bold text-slate-900 font-mono mt-0.5">₹ 1,42,850.50</p>
          <span className="text-[9px] text-emerald-600">● Effective Available</span>
        </div>

        <div className="bg-white p-3 border border-slate-200 rounded">
          <span className="text-[10px] text-slate-500 uppercase font-semibold">Total Credits (This Month)</span>
          <p className="text-base font-bold text-emerald-700 font-mono mt-0.5">+ ₹ {totalCredits.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
          <span className="text-[9px] text-slate-500">2 Inflows Recorded</span>
        </div>

        <div className="bg-white p-3 border border-slate-200 rounded">
          <span className="text-[10px] text-slate-500 uppercase font-semibold">Total Debits (This Month)</span>
          <p className="text-base font-bold text-rose-700 font-mono mt-0.5">- ₹ {totalDebits.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
          <span className="text-[9px] text-slate-500">5 Outflows Recorded</span>
        </div>

        <div className="bg-white p-3 border border-slate-200 rounded">
          <span className="text-[10px] text-slate-500 uppercase font-semibold">Branch & IFSC</span>
          <p className="text-xs font-bold text-slate-800 mt-0.5">Malleswaram West Branch</p>
          <span className="text-[10px] font-mono text-slate-600">IFSC: APEX0009182</span>
        </div>
      </div>

      {/* Table Filtering & Search Controls */}
      <div className="p-4 flex flex-wrap gap-3 justify-between items-center bg-white border-b border-slate-200">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              id="bank-transaction-search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter transactions by merchant, reference or category..."
              className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded text-xs bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 border border-slate-300 rounded p-1 bg-slate-50">
            <Filter className="w-3 h-3 text-slate-500 ml-1" />
            <button
              onClick={() => setFilterType("ALL")}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                filterType === "ALL" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-200"
              }`}
            >
              All ({MOCK_TRANSACTIONS.length})
            </button>
            <button
              onClick={() => setFilterType("DEBIT")}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                filterType === "DEBIT" ? "bg-rose-600 text-white" : "text-slate-600 hover:bg-slate-200"
              }`}
            >
              Debits
            </button>
            <button
              onClick={() => setFilterType("CREDIT")}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                filterType === "CREDIT" ? "bg-emerald-600 text-white" : "text-slate-600 hover:bg-slate-200"
              }`}
            >
              Credits
            </button>
          </div>

          <button
            onClick={() => {
              setSearchTerm("");
              setFilterType("ALL");
            }}
            className="p-1.5 border border-slate-300 rounded hover:bg-slate-100 text-slate-600"
            title="Reset Filters"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Dense Transaction Table */}
      <div className="overflow-x-auto">
        <table id="bank-transactions-table" className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-300 text-[11px] text-slate-600 uppercase font-semibold">
              <th className="py-2.5 px-3">Date</th>
              <th className="py-2.5 px-3">Transaction Details & Narration</th>
              <th className="py-2.5 px-3">Reference / UTR</th>
              <th className="py-2.5 px-3">Category</th>
              <th className="py-2.5 px-3 text-right">Debit (₹)</th>
              <th className="py-2.5 px-3 text-right">Credit (₹)</th>
              <th className="py-2.5 px-3 text-right">Closing Balance (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-[11px]">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-6 text-center text-slate-500">
                  No transaction records found matching your filter criteria.
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap">{tx.date}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-900">
                    <div className="flex items-center gap-1.5">
                      {tx.type === "DEBIT" ? (
                        <ArrowUpRight className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      ) : (
                        <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      )}
                      <span>{tx.narration}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-500 text-[10px]">{tx.ref}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px]">
                      {tx.category}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-rose-700 whitespace-nowrap">
                    {tx.type === "DEBIT" ? `₹ ${tx.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "-"}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-emerald-700 whitespace-nowrap">
                    {tx.type === "CREDIT" ? `₹ ${tx.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "-"}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800 whitespace-nowrap">
                    ₹ {tx.balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-500">
        <span>Showing {filteredTransactions.length} of {MOCK_TRANSACTIONS.length} total entries</span>
        <div className="flex gap-2">
          <button className="px-2 py-1 border border-slate-300 rounded bg-white hover:bg-slate-100 text-slate-700 font-medium flex items-center gap-1">
            <Download className="w-3 h-3" />
            Export CSV
          </button>
          <button className="px-2 py-1 border border-slate-300 rounded bg-white hover:bg-slate-100 text-slate-700 font-medium flex items-center gap-1">
            <Download className="w-3 h-3" />
            Download PDF Statement
          </button>
        </div>
      </div>
    </div>
  );
};
