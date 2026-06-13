import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Expense, Category } from "@/app/generated/prisma/client";

type ExpenseWithCategory = Expense & { category: Category };

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const expenses: ExpenseWithCategory[] = await prisma.expense.findMany({
    where: {
      userId: session.user.id,
      ...(from && to ? { spentAt: { gte: new Date(from), lte: new Date(to) } } : {}),
    },
    include: { category: true },
    orderBy: { spentAt: "desc" },
  });

  const header = "Date,Category,Amount,Currency,Note\n";
  const rows = expenses
    .map((e: ExpenseWithCategory) => {
      const date = e.spentAt.toISOString().slice(0, 10);
      const note = (e.note ?? "").replace(/"/g, '""');
      return `${date},${e.category.name},${e.amount},${e.currency},"${note}"`;
    })
    .join("\n");

  return new NextResponse(header + rows, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=expenses.csv",
    },
  });
}