import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, ChevronRight } from "lucide-react";

export default async function StudySetupPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

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
      <div className="max-w-4xl mx-auto py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white tracking-tight">Study Mode</h1>
          <p className="text-slate-400 mt-2">Сэдвээр нь дараалуулан асуулт давтах хэсэг.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {topics.map((t) => (
             <Link 
               key={t} 
               href={`/study/session?topic=${encodeURIComponent(t)}`}
               className="glass-card p-6 flex items-center justify-between group hover:border-primary/50 transition-all"
             >
               <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:bg-primary group-hover:text-white transition-all">
                     <BookOpen size={20} />
                  </div>
                  <span className="font-semibold text-slate-200 group-hover:text-white transition-colors">{t}</span>
               </div>
               <ChevronRight size={20} className="text-slate-600 group-hover:text-primary transition-all" />
             </Link>
           ))}
           
           <Link 
             href={`/study/session?topic=all`}
             className="glass-card p-6 flex items-center justify-between group hover:border-primary/50 transition-all bg-indigo-500/5"
           >
             <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-400">
                   <BookOpen size={20} />
                </div>
                <span className="font-bold text-white">БҮХ АСУУЛТ</span>
             </div>
             <ChevronRight size={20} className="text-primary" />
           </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
