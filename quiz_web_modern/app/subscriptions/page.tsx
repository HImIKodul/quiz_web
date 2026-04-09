import DashboardLayout from "@/components/layout/dashboard-layout";
import { Check, Zap, Crown } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Плас хэрэглэгч",
    price: "₮5,000",
    period: "/сард",
    features: ["Өдөрт 10 асуулт", "3 төхөөрөмж", "Түүх харах"],
    btnText: "Төлбөр төлөх",
    href: "/payment/plus",
    icon: Zap,
    color: "indigo",
  },
  {
    name: "Про хэрэглэгч",
    price: "₮10,000",
    period: "/сард",
    features: ["Хязгааргүй асуулт", "5 төхөөрөмж", "Нарийвчилсан статистик", "Бүх материал"],
    btnText: "Төлбөр төлөх",
    href: "/payment/pro",
    icon: Crown,
    color: "emerald",
    popular: true,
  },
];

export default function SubscriptionsPage() {
  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto py-10 space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white tracking-tight">Төлбөрийн багц</h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Өөрийн хэрэгцээнд хамгийн сайн тохирох багцыг сонгон шалгалтандаа бэлдээрэй.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {plans.map((plan) => (
             <div 
               key={plan.name} 
               className={cn(
                 "glass-card p-10 flex flex-col relative overflow-hidden group transition-all duration-500",
                 plan.popular ? "border-emerald-500/30 bg-emerald-500/5" : "border-white/5"
               )}
             >
               {plan.popular && (
                 <div className="absolute top-0 right-0 py-1.5 px-10 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-tighter transform rotate-45 translate-x-3 translate-y-3">
                   ПОПУЛЯР
                 </div>
               )}

               <div className="mb-8">
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110",
                    plan.color === "indigo" ? "bg-indigo-500/10 text-indigo-400" : "bg-emerald-500/10 text-emerald-400"
                  )}>
                    <plan.icon size={28} />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white">{plan.price}</span>
                    <span className="text-slate-500 font-medium">{plan.period}</span>
                  </div>
               </div>

               <ul className="space-y-4 mb-10 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-slate-300">
                      <div className="p-0.5 rounded-full bg-slate-800 text-emerald-400">
                        <Check size={14} />
                      </div>
                      <span className="text-sm">{f}</span>
                    </li>
                  ))}
               </ul>

               <Link 
                 href={plan.href}
                 className={cn(
                   "w-full py-4 rounded-xl font-black text-center transition-all shadow-lg",
                   plan.color === "indigo" 
                     ? "bg-white text-indigo-900 hover:bg-slate-100" 
                     : "premium-gradient text-white shadow-emerald-500/20"
                 )}
               >
                 {plan.btnText}
               </Link>
             </div>
           ))}
        </div>

        <div className="glass-card p-6 border-amber-500/20 bg-amber-500/5 text-center">
            <p className="text-amber-200 text-sm">
              <span className="font-bold">Анхаар:</span> Төлбөр төлсний дараа админ баталгаажуулсны дараа эрх идэвхижнэ.
            </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
