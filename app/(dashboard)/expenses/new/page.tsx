import { prisma } from "@/lib/prisma";
import ExpenseForm from "@/components/ExpenseForm";
import Link from "next/link";

export default async function NewExpensePage() {
  const categories = await prisma.category.findMany({ orderBy: { id: "asc" } });

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/expenses"
          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white border border-slate-200 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Add expense</h1>
          <p className="text-slate-500 text-sm">Record a new spending entry</p>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <ExpenseForm categories={categories} />
      </div>
    </div>
  );
}