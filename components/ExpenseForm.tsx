"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CURRENCIES, getCurrencyStep, getCurrencyMin, type Currency } from "@/lib/currency";

interface Category {
  id: number;
  name: string;
  icon: string | null;
}

interface Props {
  categories: Category[];
  expenseId?: string;
  initial?: {
    amount: number;
    currency: string;
    categoryId: number;
    spentAt: string;
    note: string;
  };
}

export default function ExpenseForm({ categories, expenseId, initial }: Props) {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);

  const [amount, setAmount] = useState(initial?.amount?.toString() ?? "");
  const [currency, setCurrency] = useState<Currency>((initial?.currency as Currency) ?? "USD");
  const [categoryId, setCategoryId] = useState(
    initial?.categoryId?.toString() ?? categories[0]?.id.toString() ?? ""
  );
  const [spentAt, setSpentAt] = useState(initial?.spentAt ?? today);
  const [note, setNote] = useState(initial?.note ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const parsedAmount = parseFloat(amount);
    const parsedCategoryId = parseInt(categoryId);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid amount");
      setLoading(false);
      return;
    }

    if (isNaN(parsedCategoryId)) {
      setError("Please select a category");
      setLoading(false);
      return;
    }

    const body = {
      amount: parsedAmount,
      currency,
      categoryId: parsedCategoryId,
      spentAt,
      note: note || undefined,
    };

    const url = expenseId ? `/api/expenses/${expenseId}` : "/api/expenses";
    const method = expenseId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
    } else {
      router.push("/expenses");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Currency selector */}
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-slate-700">Currency</label>
        <div className="grid grid-cols-2 gap-2">
          {CURRENCIES.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => setCurrency(c.code)}
              className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border text-sm font-semibold transition-all ${
                currency === c.code
                  ? "bg-indigo-50 border-indigo-300 text-indigo-700 shadow-sm"
                  : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              <span className="text-xl">{c.flag}</span>
              <span className="text-base font-bold">{c.symbol}</span>
              {c.code}
            </button>
          ))}
        </div>
      </div>

      {/* Amount */}
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-slate-700">Amount</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">
            {currency === "KHR" ? "៛" : "$"}
          </span>
          <input
            type="number"
            required
            min={getCurrencyMin(currency)}
            step={getCurrencyStep(currency)}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition shadow-sm"
            placeholder={currency === "KHR" ? "e.g. 4000" : "0.00"}
          />
        </div>
        {currency === "KHR" && (
          <p className="text-xs text-slate-400">Enter amount in Khmer Riel (e.g. 4,100 ≈ $1)</p>
        )}
      </div>

      {/* Category */}
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-slate-700">Category</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategoryId(c.id.toString())}
              className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-xs font-medium transition-all ${
                categoryId === c.id.toString()
                  ? "bg-indigo-50 border-indigo-300 text-indigo-700 shadow-sm"
                  : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              <span className="text-xl">{c.icon}</span>
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Date */}
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-slate-700">Date</label>
        <input
          type="date"
          required
          value={spentAt}
          onChange={(e) => setSpentAt(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition shadow-sm"
        />
      </div>

      {/* Note */}
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-slate-700">
          Note <span className="text-slate-400 font-normal">(optional)</span>
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          maxLength={255}
          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition shadow-sm resize-none"
          placeholder="What was this for?"
        />
      </div>

      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 bg-white border border-slate-200 text-slate-700 rounded-xl py-3 text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl py-3 text-sm font-semibold hover:from-violet-700 hover:to-indigo-700 disabled:opacity-60 transition-all shadow-lg shadow-indigo-500/25"
        >
          {loading ? "Saving…" : expenseId ? "Update expense" : "Add expense"}
        </button>
      </div>
    </form>
  );
}