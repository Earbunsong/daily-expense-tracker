import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { categorySchema } from "@/lib/validations";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  try {
    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: {
        name: parsed.data.name,
        icon: parsed.data.icon ?? null,
      },
    });
    return NextResponse.json(category);
  } catch {
    return NextResponse.json({ error: "Category name already exists" }, { status: 409 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const expenseCount = await prisma.expense.count({
    where: { categoryId: parseInt(id) },
  });

  if (expenseCount > 0)
    return NextResponse.json(
      { error: `Cannot delete — ${expenseCount} expense(s) use this category` },
      { status: 409 }
    );

  await prisma.category.delete({ where: { id: parseInt(id) } });
  return new NextResponse(null, { status: 204 });
}