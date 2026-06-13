import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ExpenseForm from "@/components/ExpenseForm";
import Link from "next/link";

export default async function EditExpensePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;

  const [expense, categories] = await Promise.all([
    prisma.expense.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { id: "asc" } }),
  ]);

  if (!expense || expense.userId !== session!.user!.id) notFound();

  const initial = {
    amount: Number(expense.amount),
    currency: expense.currency,
    categoryId: expense.categoryId,
    spentAt: expense.spentAt.toISOString().slice(0, 10),
    note: expense.note ?? "",
  };

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/expenses"
          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white border border-slate-200 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit expense</h1>
          <p className="text-slate-500 text-sm">Update your spending entry</p>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <ExpenseForm categories={categories} expenseId={id} initial={initial} />
      </div>
    </div>
  );
}