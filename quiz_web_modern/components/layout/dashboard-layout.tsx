"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  BookOpen, 
  CreditCard, 
  LogOut, 
  Settings, 
  Menu, 
  X,
  FileText
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  const navItems = [
    { name: "Нүүр хуудас", href: "/dashboard", icon: LayoutDashboard },
    { name: "Study Mode", href: "/study", icon: BookOpen },
    { name: "Төлбөр", href: "/subscriptions", icon: CreditCard },
    { name: "Унших материал", href: "/reading-list", icon: FileText },
  ];

  if (session?.user?.role === "content_admin") {
    navItems.push({ name: "Асуулт удирдах", href: "/admin/content", icon: Settings });
  }

  if (session?.user?.role === "billing_admin") {
    navItems.push({ name: "Төлбөр удирдах", href: "/admin/billing", icon: Settings });
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 transform bg-slate-900/50 backdrop-blur-xl border-r border-white/5 transition-transform duration-300 lg:relative lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-8">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="h-8 w-8 premium-gradient rounded-lg" />
              <span className="text-xl font-bold tracking-tight text-white">MATA QUIZ</span>
            </Link>
          </div>

          <nav className="flex-1 px-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                  pathname === item.href
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-white/5">
            <button
              onClick={() => signOut()}
              className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Гарах</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-20 flex items-center justify-between px-8 border-b border-white/5 lg:hidden">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-400">
            <Menu className="h-6 w-6" />
          </button>
          <span className="text-lg font-bold text-white">MATA QUIZ</span>
          <div className="w-10" /> {/* Spacer */}
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
