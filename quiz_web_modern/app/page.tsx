"use client";

import { motion } from "framer-motion";
import { 
  Trophy, 
  BookOpen, 
  ShieldCheck, 
  ArrowRight,
  Zap,
  Globe
} from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="h-20 flex items-center justify-between px-8 md:px-20 border-b border-white/5 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 premium-gradient rounded-lg" />
          <span className="text-xl font-black text-white tracking-tighter">MATA</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/login" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">Нэвтрэх</Link>
          <Link href="/signup" className="text-sm font-bold bg-white text-slate-900 px-6 py-2.5 rounded-xl hover:bg-slate-100 transition-all">Бүртгүүлэх</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-8 pt-20 pb-40 md:pt-32 md:pb-60 flex flex-col items-center text-center overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-indigo-500/10 blur-[120px] rounded-full -z-10" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8 max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-widest">
            <Zap size={14} className="fill-current" /> Шинэ үеийн шалгалтын систем
          </div>
          
          <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-[0.9]">
            Мэргэшлийн зэрэг <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-600">Ахиулах</span> гарц
          </h1>
          
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Таны цаг хугацааг хэмнэж, хамгийн үр дүнтэй аргаар мэргэшлийн шалгалтандаа бэлдэхэд туслана.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link 
              href="/signup" 
              className="w-full sm:w-auto px-10 py-5 premium-gradient rounded-2xl text-lg font-bold text-white shadow-2xl shadow-indigo-500/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              Одоо эхлэх <ArrowRight size={20} />
            </Link>
            <Link 
              href="/subscriptions" 
              className="w-full sm:w-auto px-10 py-5 bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl text-lg font-bold text-white hover:bg-white/10 transition-all"
            >
              Үнийн мэдээлэл
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="px-8 md:px-20 pb-40">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {[
             { title: "Ухаалаг систем", desc: "Таны сул талыг тодорхойлж, илүү давтах шаардлагатай сэдвийг сануулна.", icon: Zap },
             { title: "Шуурхай хариу", desc: "Шалгалт дуусмагц нарийвчилсан дүн гарч, алдаагаа шууд засах боломжтой.", icon: BookOpen },
             { title: "Аюулгүй байдал", desc: "Хэрэглэгчийн мэдээлэл болон төлбөрийн аюулгүй байдал бүрэн хангагдсан.", icon: ShieldCheck },
           ].map((feature, i) => (
             <motion.div
               key={feature.title}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               className="glass-card p-10 space-y-4 hover:border-indigo-500/40 transition-colors group"
             >
               <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                 <feature.icon size={24} />
               </div>
               <h3 className="text-xl font-bold text-white">{feature.title}</h3>
               <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
             </motion.div>
           ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 md:px-20 py-20 border-t border-white/5 text-center">
         <div className="flex items-center justify-center gap-3 mb-8">
            <div className="h-6 w-6 premium-gradient rounded-md" />
            <span className="text-lg font-black text-white tracking-tighter">MATA</span>
         </div>
         <p className="text-slate-500 text-sm">© 2026 MATA Quiz Platform. Бүх эрх хуулиар хамгаалагдсан.</p>
      </footer>
    </div>
  );
}
