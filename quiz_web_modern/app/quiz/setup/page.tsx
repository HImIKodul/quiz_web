import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { redirect } from "next/navigation";
import QuizSetupForm from "./setup-form";

export default async function QuizSetupPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.plan === "none") {
    redirect("/subscriptions?error=upgrade_required");
  }

  // Fetch unique topics
  const questions = await prisma.question.findMany({
    select: { topic: true },
    distinct: ["topic"],
  });

  const topics = questions
    .map((q) => q.topic)
    .filter((t): t is string => !!t)
    .sort();

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto py-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white tracking-tight mb-4">Мэргэшлийн зэргийн шалгалт</h1>
          <p className="text-slate-400">Асуултын тоо болон хугацааг сонгоод шалгалт эхлүүлнэ үү.</p>
        </div>

        <div className="glass-card p-10">
          <QuizSetupForm topics={topics} />
        </div>
      </div>
    </DashboardLayout>
  );
}
