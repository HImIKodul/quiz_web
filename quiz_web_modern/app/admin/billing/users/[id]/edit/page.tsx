import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import EditUserForm from "./edit-user-form";

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "billing_admin") {
    redirect("/dashboard");
  }

  const { id } = await params;
  const userId = parseInt(id);
  
  if (isNaN(userId)) notFound();

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) notFound();

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/billing"
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Хэрэглэгч засах</h1>
            <p className="text-slate-400 mt-1">ID: #{user.id} — {user.identifier}</p>
          </div>
        </div>

        <EditUserForm user={user} />
      </div>
    </DashboardLayout>
  );
}
