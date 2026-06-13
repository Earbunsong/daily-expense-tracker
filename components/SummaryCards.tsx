import { formatCurrency, type Currency } from "@/lib/currency";

interface CurrencyTotal {
  USD: number;
  KHR: number;
}

interface Props {
  todayTotal: CurrencyTotal;
  weekTotal: CurrencyTotal;
  monthTotal: CurrencyTotal;
}

function MultiAmount({ usd, khr }: { usd: number; khr: number }) {
  return (
    <div className="space-y-0.5 mt-1">
      {usd > 0 || khr === 0 ? (
        <p className="text-2xl font-bold text-slate-900 leading-tight">
          {formatCurrency(usd, "USD")}
        </p>
      ) : null}
      {khr > 0 ? (
        <p className={`font-bold text-slate-900 leading-tight ${usd > 0 ? "text-base" : "text-2xl"}`}>
          {formatCurrency(khr, "KHR")}
        </p>
      ) : null}
    </div>
  );
}

const cards = [
  { key: "today" as const, label: "Today", sub: "Spending today", icon: "☀️" },
  { key: "week" as const, label: "This Week", sub: "7-day total", icon: "📅" },
  { key: "month" as const, label: "This Month", sub: "Monthly total", icon: "📆" },
];

export default function SummaryCards({ todayTotal, weekTotal, monthTotal }: Props) {
  const values = { today: todayTotal, week: weekTotal, month: monthTotal };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((c) => (
        <div key={c.key} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">{c.label}</p>
              <MultiAmount usd={values[c.key].USD} khr={values[c.key].KHR} />
              <p className="text-xs text-slate-400 mt-0.5">{c.sub}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-lg flex-shrink-0">
              {c.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
