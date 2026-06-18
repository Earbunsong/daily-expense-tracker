import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Expense, Category } from "@/app/generated/prisma/client";
import { formatCurrency, type Currency } from "@/lib/currency";
import SummaryCards from "@/components/SummaryCards";
import CategoryPieChart from "@/components/CategoryPieChart";
import SpendingChart from "@/components/SpendingChart";
import BudgetProgress from "@/components/BudgetProgress";
import Link from "next/link";

type ExpenseWithCategory = Expense & { category: Category };

function sumByCurrency(expenses: { amount: { toString(): string } | number; currency: string }[], cur: Currency) {
  return expenses.filter((e) => e.currency === cur).reduce((s, e) => s + Number(e.amount), 0);
}

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id as string;

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [todayExp, weekExp, monthExpenses, budgets, recentExpenses] = await Promise.all([
    prisma.expense.findMany({ where: { userId, spentAt: { gte: todayStart } } }),
    prisma.expense.findMany({ where: { userId, spentAt: { gte: weekStart } } }),
    prisma.expense.findMany({
      where: { userId, spentAt: { gte: monthStart } },
      include: { category: true },
      orderBy: { spentAt: "asc" },
    }),
    prisma.budget.findMany({ where: { userId, month: monthStart } }),
    prisma.expense.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { spentAt: "desc" },
      take: 6,
    }),
  ]);

  const todayTotal = { USD: sumByCurrency(todayExp, "USD"), KHR: sumByCurrency(todayExp, "KHR") };
  const weekTotal = { USD: sumByCurrency(weekExp, "USD"), KHR: sumByCurrency(weekExp, "KHR") };
  const monthTotal = { USD: sumByCurrency(monthExpenses, "USD"), KHR: sumByCurrency(monthExpenses, "KHR") };

  function buildByCategory(expenses: ExpenseWithCategory[]) {
    const map: Record<string, { name: string; icon: string; value: number }> = {};
    for (const e of expenses) {
      const k = e.category.name;
      if (!map[k]) map[k] = { name: k, icon: e.category.icon ?? "", value: 0 };
      map[k].value += Number(e.amount);
    }
    return Object.values(map);
  }

  const usdExpenses = (monthExpenses as ExpenseWithCategory[]).filter((e) => e.currency === "USD");
  const khrExpenses = (monthExpenses as ExpenseWithCategory[]).filter((e) => e.currency === "KHR");
  const byCategoryUSD = buildByCategory(usdExpenses);
  const byCategoryKHR = buildByCategory(khrExpenses);

  function buildByDay(expenses: ExpenseWithCategory[]) {
    const map: Record<string, { date: string; total: number }> = {};
    for (const e of expenses) {
      const k = e.spentAt.toISOString().slice(0, 10);
      if (!map[k]) map[k] = { date: k, total: 0 };
      map[k].total += Number(e.amount);
    }
    return Object.values(map);
  }

  const byDayUSD = buildByDay(usdExpenses);
  const byDayKHR = buildByDay(khrExpenses);

  // Budget progress bars
  const budgetStats = budgets
    .map((b) => ({
      currency: b.currency as Currency,
      spent: sumByCurrency(monthExpenses, b.currency as Currency),
      budget: Number(b.amount),
    }))
    .filter((s) => s.budget > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <Link
          href="/expenses/new"
          className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:from-violet-700 hover:to-indigo-700 transition-all shadow-lg shadow-indigo-500/25"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add expense
        </Link>
      </div>

      <SummaryCards todayTotal={todayTotal} weekTotal={weekTotal} monthTotal={monthTotal} />

      {budgetStats.length > 0 && <BudgetProgress stats={budgetStats} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <span className="text-base">🥧</span>
            <h2 className="text-sm font-semibold text-slate-700">Spending by category</h2>
            <span className="ml-auto text-xs text-slate-400">this month</span>
          </div>
          {byCategoryUSD.length > 0 && (
            <div className={byCategoryKHR.length > 0 ? "mb-4" : ""}>
              {byCategoryKHR.length > 0 && (
                <p className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1">🇺🇸 USD</p>
              )}
              <CategoryPieChart data={byCategoryUSD} currency="USD" />
            </div>
          )}
          {byCategoryKHR.length > 0 && (
            <div>
              {byCategoryUSD.length > 0 && (
                <p className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1">🇰🇭 KHR</p>
              )}
              <CategoryPieChart data={byCategoryKHR} currency="KHR" />
            </div>
          )}
          {byCategoryUSD.length === 0 && byCategoryKHR.length === 0 && (
            <CategoryPieChart data={[]} currency="USD" />
          )}
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <span className="text-base">📈</span>
            <h2 className="text-sm font-semibold text-slate-700">Daily spending · ចំណាយប្រចាំថ្ងៃ</h2>
            <span className="ml-auto text-xs text-slate-400">this month</span>
          </div>
          {byDayUSD.length > 0 && (
            <div className={byDayKHR.length > 0 ? "mb-4" : ""}>
              {byDayKHR.length > 0 && (
                <p className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1">🇺🇸 USD · ដុល្លារ</p>
              )}
              <SpendingChart data={byDayUSD} currency="USD" />
            </div>
          )}
          {byDayKHR.length > 0 && (
            <div>
              {byDayUSD.length > 0 && (
                <p className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1">🇰🇭 KHR · រៀល</p>
              )}
              <SpendingChart data={byDayKHR} currency="KHR" />
            </div>
          )}
          {byDayUSD.length === 0 && byDayKHR.length === 0 && (
            <SpendingChart data={[]} currency="USD" />
          )}
        </div>
      </div>

      {/* Recent */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
          <div className="flex items-center gap-2">
            <span className="text-base">🕐</span>
            <h2 className="text-sm font-semibold text-slate-700">Recent expenses</h2>
          </div>
          <Link href="/expenses" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
            View all
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {recentExpenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <span className="text-4xl mb-3">💸</span>
            <p className="text-slate-600 font-medium">No expenses yet</p>
            <Link href="/expenses/new" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 underline underline-offset-2 mt-2">
              Add your first expense
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-slate-50">
            {(recentExpenses as ExpenseWithCategory[]).map((e) => (
              <li key={e.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50/60 transition-colors">
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-base flex-shrink-0">
                    {e.category.icon ?? "📦"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{e.category.name}</p>
                    {e.note && <p className="text-xs text-slate-400 truncate max-w-xs">{e.note}</p>}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">
                    {formatCurrency(Number(e.amount), e.currency as Currency)}
                  </p>
                  <p className="text-xs text-slate-400">
                    {e.currency === "KHR" ? "🇰🇭" : "🇺🇸"} {e.spentAt.toISOString().slice(0, 10)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
