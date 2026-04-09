import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { 
  Trophy, 
  XCircle, 
  CheckCircle2, 
  ChevronLeft,
  RefreshCw
} from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default async function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { id } = await params;
  const attemptId = parseInt(id);

  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: attemptId },
    include: { details: true },
  });

  if (!attempt || attempt.userId !== parseInt(session.user.id)) {
    redirect("/dashboard");
  }

  const isPassed = attempt.scorePercent >= 60;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Result Header */}
        <div className="glass-card overflow-hidden">
          <div className={cn(
            "p-10 text-center text-white",
            isPassed ? "premium-gradient" : "bg-gradient-to-br from-red-600 to-red-800"
          )}>
            <div className="mb-6 flex justify-center">
              {isPassed ? (
                <div className="p-4 bg-white/20 rounded-full backdrop-blur-md">
                  <Trophy size={48} />
                </div>
              ) : (
                <div className="p-4 bg-white/20 rounded-full backdrop-blur-md">
                  <XCircle size={48} />
                </div>
              )}
            </div>
            <h1 className="text-4xl font-bold mb-2">
              {isPassed ? "Амжилттай!" : "Амжилтгүй"}
            </h1>
            <p className="text-white/80">Таны шалгалтын үр дүн</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x border-white/5">
            <div className="p-8 text-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Үнэлгээ</span>
              <p className={cn(
                "text-4xl font-black tabular-nums",
                isPassed ? "text-emerald-400" : "text-red-400"
              )}>{attempt.scorePercent}%</p>
            </div>
            <div className="p-8 text-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Зөв / Нийт</span>
              <p className="text-4xl font-black text-white tabular-nums">
                {attempt.correctAnswers} <span className="text-slate-700 font-light">/</span> {attempt.totalQuestions}
              </p>
            </div>
            <div className="p-8 text-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Огноо</span>
              <p className="text-lg font-bold text-white mt-2">
                {format(new Date(attempt.timestamp), "yyyy-MM-dd")}
              </p>
              <p className="text-xs text-slate-500">
                {format(new Date(attempt.timestamp), "HH:mm")}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link 
            href="/quiz/setup" 
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-slate-900 border border-slate-800 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all font-semibold"
          >
            <RefreshCw size={18} /> Дахин өгөх
          </Link>
          <Link 
            href="/dashboard" 
            className="flex-1 flex items-center justify-center gap-2 py-4 border border-white/5 text-slate-400 rounded-2xl font-bold hover:bg-white/5 transition-all font-semibold"
          >
            <ChevronLeft size={18} /> Нүүр хуудас
          </Link>
        </div>

        {/* Detailed Breakdown */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Дэлгэрэнгүй тойм</h2>
          <div className="space-y-3">
            {attempt.details.map((d, idx) => (
              <div key={d.id} className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:bg-white/5 transition-all">
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "mt-1 p-2 rounded-lg",
                    d.isCorrect ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                  )}>
                    {d.isCorrect ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Асуулт #{idx + 1}</h4>
                    <p className="text-sm text-slate-500 mt-1">{d.topic || "Сэдэв тодорхойгүй"}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-10">
                   <div className="space-y-1">
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Таны хариулт</span>
                      <p className={cn("font-bold text-lg", d.isCorrect ? "text-emerald-400" : "text-red-400")}>
                        {d.userAnswer || "—"}
                      </p>
                   </div>
                   {!d.isCorrect && (
                     <div className="space-y-1">
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Зөв хариулт</span>
                        <p className="font-bold text-lg text-emerald-400">
                          {d.correctAnswer}
                        </p>
                     </div>
                   )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
