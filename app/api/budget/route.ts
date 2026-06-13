import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { budgetSchema } from "@/lib/validations";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month");
  const currency = searchParams.get("currency") ?? "USD";

  const now = new Date();
  const monthStart = month ? new Date(month) : new Date(now.getFullYear(), now.getMonth(), 1);

  const budget = await prisma.budget.findUnique({
    where: { userId_month_currency: { userId: session.user.id, month: monthStart, currency } },
  });

  return NextResponse.json(budget ?? null);
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = budgetSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const monthStart = new Date(parsed.data.month);
  const currency = parsed.data.currency;

  const budget = await prisma.budget.upsert({
    where: { userId_month_currency: { userId: session.user.id, month: monthStart, currency } },
    update: { amount: parsed.data.amount },
    create: {
      userId: session.user.id,
      month: monthStart,
      amount: parsed.data.amount,
      currency,
    },
  });

  return NextResponse.json(budget);
}