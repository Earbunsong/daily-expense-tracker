import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar email={session.user?.email ?? ""} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 pt-6 pb-24 lg:px-6 lg:py-8">{children}</div>
      </main>
    </div>
  );
}
