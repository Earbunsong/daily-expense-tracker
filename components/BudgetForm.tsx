"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CURRENCIES, type Currency } from "@/lib/currency";

interface BudgetEntry {
  amount: number;
  currency: Currency;
}

interface Props {
  currentMonth: string;
  existing: BudgetEntry[];
}

export default function BudgetForm({ currentMonth, existing }: Props) {
  const router = useRouter();

  const getExisting = (c: Currency) => existing.find((b) => b.currency === c)?.amount ?? 0;

  const [currency, setCurrency] = useState<Currency>("USD");
  const [amount, setAmount] = useState(
    getExisting("USD") > 0 ? getExisting("USD").toString() : ""
  );
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function handleCurrencyChange(c: Currency) {
    setCurrency(c);
    const ex = getExisting(c);
    setAmount(ex > 0 ? ex.toString() : "");
    setError("");
    setSuccess("");
  }

  const monthLabel = new Date(currentMonth + "T00:00:00").toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const res = await fetch("/api/budget", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ month: currentMonth, amount: parseFloat(amount), currency }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Failed to save budget");
    } else {
      setSuccess(`${currency} budget saved!`);
      router.refresh();
    }
  }

  const activeCurrency = CURRENCIES.find((c) => c.code === currency)!;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Month indicator */}
      <div className="flex items-center gap-3 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
        <span className="text-2xl">🗓️</span>
        <div>
          <p className="text-sm font-semibold text-indigo-900">{monthLabel}</p>
          <p className="text-xs text-indigo-500">Set a budget limit per currency</p>
        </div>
      </div>

      {/* Currency selector */}
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-slate-700">Currency</label>
        <div className="grid grid-cols-2 gap-2">
          {CURRENCIES.map((c) => {
            const ex = getExisting(c.code);
            return (
              <button
                key={c.code}
                type="button"
                onClick={() => handleCurrencyChange(c.code)}
                className={`flex flex-col items-start gap-1 py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                  currency === c.code
                    ? "bg-indigo-50 border-indigo-300 text-indigo-700 shadow-sm"
                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{c.flag}</span>
                  <span className="font-bold">{c.code}</span>
                </div>
                {ex > 0 ? (
                  <span className="text-xs text-emerald-600 font-medium">
                    {c.symbol}{ex > 999 ? ex.toLocaleString() : ex.toFixed(2)} set
                  </span>
                ) : (
                  <span className="text-xs text-slate-400">Not set</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          <span>⚠️</span> {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-xl">
          <span>✅</span> {success}
        </div>
      )}

      {/* Amount input */}
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-slate-700">
          {activeCurrency.name} budget amount
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">
            {activeCurrency.symbol}
          </span>
          <input
            type="number"
            required
            min={currency === "KHR" ? "100" : "0.01"}
            step={currency === "KHR" ? "1" : "0.01"}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition shadow-sm"
            placeholder={currency === "KHR" ? "e.g. 2000000" : "e.g. 500.00"}
          />
        </div>
        {currency === "KHR" && (
          <p className="text-xs text-slate-400">Enter in Riel (e.g. 2,050,000 ≈ $500)</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl py-3 text-sm font-semibold hover:from-violet-700 hover:to-indigo-700 disabled:opacity-60 transition-all shadow-lg shadow-indigo-500/25"
      >
        {loading ? "Saving…" : `Save ${currency} budget`}
      </button>
    </form>
  );
}
