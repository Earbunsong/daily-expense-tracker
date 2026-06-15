import { prisma } from "@/lib/prisma";
import CategoryManager from "@/components/CategoryManager";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({ orderBy: { id: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
        <p className="text-slate-500 text-sm mt-0.5">Manage your expense categories</p>
      </div>
      <CategoryManager initial={categories} />
    </div>
  );
}