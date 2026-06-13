import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, type Currency } from "@/lib/currency";
import BudgetForm from "@/components/BudgetForm";

export default async function BudgetPage() {
  const session = await auth();
  const userId = session!.user!.id as string;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [budgets, usdAgg, khrAgg] = await Promise.all([
    prisma.budget.findMany({ where: { userId, month: monthStart } }),
    prisma.expense.aggregate({
      where: { userId, spentAt: { gte: monthStart }, currency: "USD" },
      _sum: { amount: true },
    }),
    prisma.expense.aggregate({
      where: { userId, spentAt: { gte: monthStart }, currency: "KHR" },
      _sum: { amount: true },
    }),
  ]);

  const usdSpent = Number(usdAgg._sum.amount ?? 0);
  const khrSpent = Number(khrAgg._sum.amount ?? 0);

  const getB = (c: Currency) => budgets.find((b) => b.currency === c);
  const usdBudget = getB("USD");
  const khrBudget = getB("KHR");

  const existing = budgets.map((b) => ({
    amount: Number(b.amount),
    currency: b.currency as Currency,
  }));

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Monthly Budget</h1>
        <p className="text-slate-500 text-sm mt-0.5">Set separate limits for USD and KHR spending</p>
      </div>

      {/* Current status cards */}
      {(usdBudget || khrBudget) && (
        <div className="grid grid-cols-2 gap-3 mb-5">
          {(["USD", "KHR"] as Currency[]).map((cur) => {
            const b = getB(cur);
            const spent = cur === "USD" ? usdSpent : khrSpent;
            const budgetAmt = b ? Number(b.amount) : 0;
            const pct = budgetAmt > 0 ? Math.min((spent / budgetAmt) * 100, 100) : 0;
            const flag = cur === "USD" ? "🇺🇸" : "🇰🇭";

            return (
              <div key={cur} className="bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl p-4 text-white shadow-lg shadow-indigo-500/20">
                <p className="text-white/70 text-xs font-medium mb-1">{flag} {cur} spent</p>
                <p className="text-xl font-bold leading-tight">{formatCurrency(spent, cur)}</p>
                {budgetAmt > 0 ? (
                  <>
                    <p className="text-white/60 text-xs mt-0.5">of {formatCurrency(budgetAmt, cur)}</p>
                    <div className="mt-3 h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-white/80 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-white/60 text-xs mt-1">{pct.toFixed(0)}% used</p>
                  </>
                ) : (
                  <p className="text-white/50 text-xs mt-1">No budget set</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <BudgetForm currentMonth={monthStart.toISOString().slice(0, 10)} existing={existing} />
      </div>
    </div>
  );
}