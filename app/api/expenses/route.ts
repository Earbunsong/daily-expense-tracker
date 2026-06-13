import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { expenseSchema } from "@/lib/validations";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const categoryId = searchParams.get("category");
  const currency = searchParams.get("currency");

  const expenses = await prisma.expense.findMany({
    where: {
      userId: session.user.id,
      ...(from && to ? { spentAt: { gte: new Date(from), lte: new Date(to) } } : {}),
      ...(categoryId ? { categoryId: parseInt(categoryId) } : {}),
      ...(currency ? { currency } : {}),
    },
    include: { category: true },
    orderBy: { spentAt: "desc" },
  });

  return NextResponse.json(expenses);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = expenseSchema.safeParse(body);

  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const expense = await prisma.expense.create({
    data: {
      userId: session.user.id,
      amount: parsed.data.amount,
      currency: parsed.data.currency,
      categoryId: parsed.data.categoryId,
      spentAt: new Date(parsed.data.spentAt),
      note: parsed.data.note ?? null,
    },
    include: { category: true },
  });

  return NextResponse.json(expense, { status: 201 });
}
