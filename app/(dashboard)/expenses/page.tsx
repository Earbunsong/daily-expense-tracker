import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Expense, Category } from "@/app/generated/prisma/client";
import Link from "next/link";
import ExpenseListClient from "@/components/ExpenseListClient";

type ExpenseWithCategory = Expense & { category: Category };

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; category?: string; currency?: string }>;
}) {
  const session = await auth();
  const userId = session!.user!.id as string;
  const params = await searchParams;

  const categories = await prisma.category.findMany({ orderBy: { id: "asc" } });

  const expenses: ExpenseWithCategory[] = await prisma.expense.findMany({
    where: {
      userId,
      ...(params.from && params.to ? { spentAt: { gte: new Date(params.from), lte: new Date(params.to) } } : {}),
      ...(params.category ? { categoryId: parseInt(params.category) } : {}),
      ...(params.currency ? { currency: params.currency } : {}),
    },
    include: { category: true },
    orderBy: { spentAt: "desc" },
  });

  const serialized = expenses.map((e) => ({
    id: e.id,
    amount: Number(e.amount),
    currency: e.currency,
    spentAt: e.spentAt.toISOString().slice(0, 10),
    createdAt: e.createdAt.toISOString(),
    note: e.note,
    category: e.category,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Expenses</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage and review your spending</p>
        </div>
        <div className="flex gap-2">
          <a href="/api/expenses/export"
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            CSV
          </a>
          <Link href="/expenses/new"
            className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:from-violet-700 hover:to-indigo-700 transition-all shadow-lg shadow-indigo-500/25">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add expense
          </Link>
        </div>
      </div>

      <ExpenseListClient expenses={serialized} categories={categories} filters={params} />
    </div>
  );
}
