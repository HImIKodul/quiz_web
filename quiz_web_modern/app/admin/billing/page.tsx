import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { 
  Users, 
  CreditCard, 
  History as HistoryIcon,
  Check,
  X,
  Search,
  Activity as ActivityIcon
} from "lucide-react";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default async function BillingAdminPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "billing_admin") {
    redirect("/dashboard");
  }

  // Parallel data fetching
  const [pendingRequests, users, recentLogs] = await Promise.all([
    prisma.paymentRequest.findMany({
      where: { status: "pending" },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.activityLog.findMany({
      orderBy: { timestamp: "desc" },
      take: 10,
    }),
  ]);

  return (
    <DashboardLayout>
      <div className="space-y-10">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Санхүүгийн удирдлага</h1>
          <p className="text-slate-400 mt-1">Төлбөрийн хүсэлт болон эрх сунгалтыг удирдах хэсэг.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           <div className="glass-card p-6 flex flex-col justify-center border-l-4 border-indigo-500">
              <span className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Хүлээгдэж буй</span>
              <h2 className="text-3xl font-black text-white">{pendingRequests.length}</h2>
              <p className="text-sm text-slate-500 mt-2">Баталгаажуулах шаардлагатай хүсэлт</p>
           </div>
           <div className="glass-card p-6 flex flex-col justify-center border-l-4 border-emerald-500">
              <span className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Нийт хэрэглэгч</span>
              <h2 className="text-3xl font-black text-white">{users.length}+</h2>
              <p className="text-sm text-slate-500 mt-2">Системд бүртгэлтэй нийт хэрэглэгч</p>
           </div>
           <div className="glass-card p-6 flex flex-col justify-center border-l-4 border-amber-500">
              <span className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Сүүлийн үйлдэл</span>
              <h2 className="text-3xl font-black text-white">Идэвхитэй</h2>
              <p className="text-sm text-slate-500 mt-2">Системийн лог хяналт идэвхитэй байна</p>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pending Requests */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
               <CreditCard size={20} className="text-indigo-400" /> Төлбөрийн хүсэлтүүд
            </h3>
            <div className="space-y-3">
              {pendingRequests.length > 0 ? (
                pendingRequests.map((req) => (
                  <div key={req.id} className="glass-card p-5 flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-indigo-400 font-bold">
                        {req.user.name[0]}
                      </div>
                      <div>
                        <p className="font-bold text-white">{req.user.name}</p>
                        <p className="text-xs text-slate-500">{req.user.identifier} • {req.requestedPlan.toUpperCase()} багц</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="h-10 w-10 flex items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all">
                        <Check size={18} />
                      </button>
                      <button className="h-10 w-10 flex items-center justify-center rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="glass-card p-12 text-center text-slate-500 bg-white/[0.02]">
                  Шинэ хүсэлт байхгүй байна.
                </div>
              )}
            </div>

            {/* User Management Preview */}
            <div className="space-y-6 pt-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                 <Users size={20} className="text-emerald-400" /> Сүүлийн хэрэглэгчид
              </h3>
              <div className="glass-card overflow-hidden">
                <table className="w-full text-left text-sm">
                   <thead>
                      <tr className="border-b border-white/5 bg-white/5 text-slate-500 font-bold text-[10px] uppercase tracking-widest">
                         <th className="px-6 py-4">Хэрэглэгч</th>
                         <th className="px-6 py-4">Багц</th>
                         <th className="px-6 py-4">Огноо</th>
                         <th className="px-6 py-4"></th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5 text-slate-400">
                      {users.map(u => (
                        <tr key={u.id} className="hover:bg-white/5 transition-colors">
                           <td className="px-6 py-4">
                              <p className="text-slate-200 font-medium">{u.name}</p>
                              <p className="text-[10px]">{u.identifier}</p>
                           </td>
                           <td className="px-6 py-4">
                              <span className={cn(
                                "text-[10px] font-bold px-2 py-0.5 rounded uppercase",
                                u.plan === 'pro' ? 'bg-indigo-500/20 text-indigo-400' : 
                                u.plan === 'plus' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
                              )}>
                                {u.plan}
                              </span>
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap">
                              {format(new Date(u.createdAt), "yyyy/MM/dd")}
                           </td>
                           <td className="px-6 py-4 text-right">
                              <Link 
                                href={`/admin/billing/users/${u.id}/edit`}
                                className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-all inline-block"
                              >
                                 <Search size={14} />
                              </Link>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Activity Sidebar */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
               <ActivityIcon size={20} className="text-amber-400" /> Системийн лог
            </h3>
            <div className="glass-card p-6 space-y-6">
              {recentLogs.map((log) => (
                <div key={log.id} className="relative pl-6 border-l border-white/10 pb-6 last:pb-0">
                  <div className="absolute left-[-5px] top-1 h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                  <p className="text-xs text-slate-500 font-mono mb-1">{format(new Date(log.timestamp), "HH:mm:ss")}</p>
                  <p className="text-sm text-slate-200 font-medium">{log.action.replace(/_/g, ' ').toUpperCase()}</p>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">{log.details}</p>
                </div>
              ))}
              <Link href="/admin/logs" className="block text-center text-xs font-bold text-indigo-400 hover:text-indigo-300 pt-4 border-t border-white/5">
                БҮХ ЛОГ ХАРАХ
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="glass-card p-6 bg-indigo-500/5 border-indigo-500/10">
               <h4 className="text-sm font-bold text-white mb-4">Шуурхай үйлдэл</h4>
               <div className="grid grid-cols-2 gap-3">
                  <button className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-[10px] font-bold text-slate-400 hover:text-white transition-all">
                     DATABASE ВАСKUP
                  </button>
                  <button className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-[10px] font-bold text-slate-400 hover:text-white transition-all">
                     SYSTEM RESTART
                  </button>
               </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
