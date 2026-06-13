import { formatCurrency, type Currency } from "@/lib/currency";

interface BudgetStat {
  currency: Currency;
  spent: number;
  budget: number;
}

interface Props {
  stats: BudgetStat[];
}

function SingleBar({ currency, spent, budget }: BudgetStat) {
  const pct = Math.min((spent / budget) * 100, 100);
  const over = spent > budget;
  const warning = !over && pct >= 80;

  const barColor = over
    ? "from-red-400 to-rose-500"
    : warning
    ? "from-amber-400 to-orange-400"
    : "from-violet-500 to-indigo-500";

  const statusColor = over ? "text-red-600" : warning ? "text-amber-600" : "text-emerald-600";
  const statusBg = over ? "bg-red-50 border-red-100" : warning ? "bg-amber-50 border-amber-100" : "bg-emerald-50 border-emerald-100";
  const statusIcon = over ? "🔴" : warning ? "⚠️" : "✅";
  const statusText = over
    ? `Over by ${formatCurrency(spent - budget, currency)}`
    : warning
    ? `${pct.toFixed(0)}% used — approaching limit`
    : `${formatCurrency(budget - spent, currency)} remaining`;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-700">
            {currency === "KHR" ? "🇰🇭 KHR Budget" : "🇺🇸 USD Budget"}
          </span>
        </div>
        <span className="text-sm text-slate-500">
          <span className="font-bold text-slate-900">{formatCurrency(spent, currency)}</span>
          {" / "}
          {formatCurrency(budget, currency)}
        </span>
      </div>
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-medium ${statusBg} ${statusColor}`}>
        <span>{statusIcon}</span> {statusText}
      </div>
    </div>
  );
}

export default function BudgetProgress({ stats }: Props) {
  if (stats.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-5">
      <div className="flex items-center gap-2">
        <span className="text-base">🎯</span>
        <span className="text-sm font-semibold text-slate-700">Monthly Budgets</span>
      </div>
      {stats.map((s) => (
        <SingleBar key={s.currency} {...s} />
      ))}
    </div>
  );
}
