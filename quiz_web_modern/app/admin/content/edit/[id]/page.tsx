import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import EditQuestionForm from "./edit-form";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function EditQuestionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "content_admin") {
    redirect("/dashboard");
  }

  const { id } = await params;
  const questionId = parseInt(id);
  
  if (isNaN(questionId)) notFound();

  const question = await prisma.question.findUnique({
    where: { id: questionId },
  });

  if (!question) notFound();

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/content"
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Асуулт засах</h1>
            <p className="text-slate-400 mt-1">ID: #{question.id} — Төрөл: {question.qType.toUpperCase()}</p>
          </div>
        </div>

        <EditQuestionForm question={question} />
      </div>
    </DashboardLayout>
  );
}
