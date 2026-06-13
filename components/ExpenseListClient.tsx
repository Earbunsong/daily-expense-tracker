"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatCurrency, CURRENCIES, type Currency } from "@/lib/currency";

interface Category {
  id: number;
  name: string;
  icon: string | null;
}

interface Expense {
  id: string;
  amount: number;
  currency: string;
  spentAt: string;
  note: string | null;
  category: Category;
}

interface Props {
  expenses: Expense[];
  categories: Category[];
  filters: { from?: string; to?: string; category?: string; currency?: string };
}

export default function ExpenseListClient({ expenses, categories, filters }: Props) {
  const router = useRouter();
  const [from, setFrom] = useState(filters.from ?? "");
  const [to, setTo] = useState(filters.to ?? "");
  const [category, setCategory] = useState(filters.category ?? "");
  const [currency, setCurrency] = useState(filters.currency ?? "");
  const [deleting, setDeleting] = useState<string | null>(null);

  const usdTotal = expenses.filter((e) => e.currency === "USD").reduce((s, e) => s + e.amount, 0);
  const khrTotal = expenses.filter((e) => e.currency === "KHR").reduce((s, e) => s + e.amount, 0);

  function applyFilters() {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (category) params.set("category", category);
    if (currency) params.set("currency", currency);
    router.push(`/expenses?${params.toString()}`);
  }

  function clearFilters() {
    setFrom(""); setTo(""); setCategory(""); setCurrency("");
    router.push("/expenses");
  }

  async function deleteExpense(id: string) {
    if (!confirm("Delete this expense?")) return;
    setDeleting(id);
    await fetch(`/api/expenses/${id}`, { method: "DELETE" });
    setDeleting(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {/* Filter card */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Filters</p>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-500">From</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-500">To</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-500">Currency</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition">
              <option value="">All</option>
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-500">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition">
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={applyFilters}
              className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-xl hover:bg-indigo-700 transition font-medium">
              Apply
            </button>
            {(from || to || category || currency) && (
              <button onClick={clearFilters}
                className="bg-slate-100 text-slate-600 text-sm px-4 py-2 rounded-xl hover:bg-slate-200 transition font-medium">
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-50">
          <p className="text-sm font-semibold text-slate-700">
            {expenses.length} {expenses.length === 1 ? "expense" : "expenses"}
          </p>
          {expenses.length > 0 && (
            <div className="flex items-center gap-3">
              {usdTotal > 0 && (
                <span className="text-sm font-bold text-slate-900">
                  <span className="text-slate-400 font-normal text-xs mr-1">🇺🇸</span>
                  {formatCurrency(usdTotal, "USD")}
                </span>
              )}
              {khrTotal > 0 && (
                <span className="text-sm font-bold text-slate-900">
                  <span className="text-slate-400 font-normal text-xs mr-1">🇰🇭</span>
                  {formatCurrency(khrTotal, "KHR")}
                </span>
              )}
            </div>
          )}
        </div>

        {expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <span className="text-4xl mb-3">🔍</span>
            <p className="text-slate-600 font-medium">No expenses found</p>
            <p className="text-slate-400 text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-50">
            {expenses.map((e) => (
              <li key={e.id} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50/60 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-lg flex-shrink-0">
                    {e.category.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{e.category.name}</p>
                    {e.note && <p className="text-xs text-slate-400 truncate max-w-xs mt-0.5">{e.note}</p>}
                    <p className="text-xs text-slate-400 mt-0.5">{e.spentAt}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">
                      {formatCurrency(e.amount, e.currency as Currency)}
                    </p>
                    <p className="text-xs text-slate-400">
                      {e.currency === "KHR" ? "🇰🇭" : "🇺🇸"} {e.currency}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Link href={`/expenses/${e.id}/edit`}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>
                    <button onClick={() => deleteExpense(e.id)} disabled={deleting === e.id}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40" title="Delete">
                      {deleting === e.id ? (
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
