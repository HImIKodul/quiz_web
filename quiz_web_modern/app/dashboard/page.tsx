import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { 
  Trophy, 
  Smartphone, 
  Settings, 
  TrendingUp, 
  ChevronRight,
  Clock,
  BookOpen,
  FileText
} from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const userId = parseInt(session.user.id);

  // Fetch data in parallel
  const [user, attempts, devices] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
    }),
    prisma.quizAttempt.findMany({
      where: { userId: userId },
      orderBy: { timestamp: "desc" },
      take: 5,
    }),
    prisma.userDevice.findMany({
      where: { userId: userId },
      orderBy: { registeredAt: "desc" },
    }),
  ]);

  if (!user) return null;

  const planLabel = user.plan.toUpperCase();
  const expiryDate = user.planExpireDate 
    ? format(new Date(user.planExpireDate), "yyyy-MM-dd")
    : "—";

  return (
    <DashboardLayout>
      <div className="space-y-10">
        {/* Welcome Header */}
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Тавтай морилно уу, {user.name}!</h1>
          <p className="text-slate-400 mt-2">Та өнөөдөр шалгалтандаа бэлдэхэд бэлэн үү?</p>
        </div>

        {/* Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Subscription Card */}
          <div className="glass-card p-6 flex flex-col justify-between overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <TrendingUp size={120} />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Trophy size={20} />
                </div>
                <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Миний багц</span>
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-white">{planLabel}</h2>
                <p className="text-sm text-slate-500">
                  {user.plan === "none" ? "Үнэгүй багц ашиглаж байна" : `Дуусах хугацаа: ${expiryDate}`}
                </p>
              </div>
            </div>
            <Link 
              href="/subscriptions" 
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Багц ахих <ChevronRight size={16} />
            </Link>
          </div>

          {/* Devices Card */}
          <div className="glass-card p-6 flex flex-col justify-between overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Smartphone size={120} />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Smartphone size={20} />
                </div>
                <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Төхөөрөмжүүд</span>
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-white">{devices.length} / {user.maxDevices || 3}</h2>
                <p className="text-sm text-slate-500">Бүртгэлтэй төхөөрөмжийн тоо</p>
              </div>
            </div>
            <p className="mt-6 text-xs text-slate-600">Төхөөрөмж устгах бол админтай холбогдоно уу</p>
          </div>

          {/* Quick Start Card */}
          <div className="glass-card p-6 premium-gradient text-white flex flex-col justify-between shadow-xl shadow-indigo-500/20">
            <div>
              <h2 className="text-xl font-bold mb-2">Шалгалт эхлэх</h2>
              <p className="text-indigo-100/70 text-sm">Сүүлийн үеийн асуултууд дээр өөрийгөө сориорой.</p>
            </div>
            <Link 
              href="/quiz/setup" 
              className="mt-6 w-full flex items-center justify-center gap-2 bg-white text-indigo-600 py-3 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-lg"
            >
              Эхлэх
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* History List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Шалгалтын түүх</h3>
              <Link href="/history" className="text-sm text-indigo-400 hover:underline">Бүгдийг харах</Link>
            </div>
            
            <div className="space-y-3">
              {attempts.length > 0 ? (
                attempts.map((a) => (
                  <div key={a.id} className="glass-card p-4 flex items-center justify-between group hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${a.scorePercent >= 60 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{a.scorePercent}% Үнэлгээ</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><Clock size={12}/> {format(new Date(a.timestamp), "yyyy-MM-dd HH:mm")}</span>
                          <span className="flex items-center gap-1"><BookOpen size={12}/> {a.totalQuestions} асуулт</span>
                        </div>
                      </div>
                    </div>
                    <Link 
                      href={`/result/${a.id}`} 
                      className="p-2 h-10 w-10 flex items-center justify-center rounded-lg border border-white/5 text-slate-400 group-hover:bg-primary group-hover:text-white transition-all"
                    >
                      →
                    </Link>
                  </div>
                ))
              ) : (
                <div className="glass-card p-12 text-center">
                  <p className="text-slate-500">Түүх байхгүй байна.</p>
                </div>
              )}
            </div>
          </div>

          {/* Study Mode Preview Card */}
          <div className="glass-card p-6 border-indigo-500/20 bg-indigo-500/5">
             <div className="p-3 w-fit rounded-xl bg-indigo-500/20 text-indigo-400 mb-4">
                <BookOpen size={24} />
             </div>
             <h3 className="text-xl font-bold text-white mb-2">Study Mode</h3>
             <p className="text-slate-400 text-sm mb-6 leading-relaxed">
               Сэдвээр нь дараалуулан асуулт давтах, шуурхай хариулт шалгах, хэвлэх боломжтой.
             </p>
             <Link 
               href="/study" 
               className="flex items-center justify-center w-full py-3 border border-indigo-500/30 rounded-xl text-indigo-400 font-semibold hover:bg-indigo-500 hover:text-white transition-all"
             >
               Одоо эхлэх
             </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
