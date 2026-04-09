import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, Clock, User, Activity } from "lucide-react";
import Link from "next/link";

export default async function AuditLogsPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "billing_admin" && session.user.role !== "content_admin")) {
    redirect("/dashboard");
  }

  const logs = await prisma.activityLog.findMany({
    orderBy: { timestamp: "desc" },
    take: 100,
  });

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/billing"
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Audit Logs</h1>
            <p className="text-slate-400 mt-1">Системийн сүүлийн 100 үйлдэл</p>
          </div>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/5 text-xs font-bold text-slate-500 uppercase tracking-widest">
                  <th className="px-6 py-4">Time</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                      No logs found.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-slate-400 text-xs font-mono">
                          <Clock size={14} />
                          {format(new Date(log.timestamp), "yyyy/MM/dd HH:mm:ss")}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                           <User size={14} className="text-indigo-400" />
                           <span className="text-sm text-slate-200">{log.userIdentifier || "System"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded bg-white/5 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                          {log.action.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-slate-400 max-w-md line-clamp-2">{log.details}</p>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
