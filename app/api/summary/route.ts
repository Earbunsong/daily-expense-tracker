import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Expense, Category } from "@/app/generated/prisma/client";

type ExpenseWithCategory = Expense & { category: Category };

function buildSummary(expenses: ExpenseWithCategory[]) {
  const total = expenses.reduce((s, e) => s + Number(e.amount), 0);

  const byCategoryMap: Record<string, { name: string; icon: string; value: number }> = {};
  for (const e of expenses) {
    const k = e.category.name;
    if (!byCategoryMap[k]) byCategoryMap[k] = { name: k, icon: e.category.icon ?? "", value: 0 };
    byCategoryMap[k].value += Number(e.amount);
  }

  const byDayMap: Record<string, { date: string; total: number }> = {};
  for (const e of expenses) {
    const k = e.spentAt.toISOString().slice(0, 10);
    if (!byDayMap[k]) byDayMap[k] = { date: k, total: 0 };
    byDayMap[k].total += Number(e.amount);
  }

  return {
    total,
    byCategory: Object.values(byCategoryMap),
    byDay: Object.values(byDayMap),
  };
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") ?? "month";

  const now = new Date();
  let from: Date;
  if (period === "day") {
    from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (period === "week") {
    from = new Date(now);
    from.setDate(now.getDate() - now.getDay());
    from.setHours(0, 0, 0, 0);
  } else {
    from = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const expenses: ExpenseWithCategory[] = await prisma.expense.findMany({
    where: { userId: session.user.id, spentAt: { gte: from, lte: now } },
    include: { category: true },
    orderBy: { spentAt: "asc" },
  });

  const usd = buildSummary(expenses.filter((e) => e.currency === "USD"));
  const khr = buildSummary(expenses.filter((e) => e.currency === "KHR"));

  return NextResponse.json({ USD: usd, KHR: khr, period });
}
