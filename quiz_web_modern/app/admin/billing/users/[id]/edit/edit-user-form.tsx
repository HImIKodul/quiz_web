"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Save, 
  User as UserIcon, 
  Calendar, 
  ShieldCheck, 
  Smartphone,
  CreditCard as PlanIcon
} from "lucide-react";
import Link from "next/link";
import { updateUserDetails } from "@/lib/actions/admin";

export default function EditUserForm({ user }: { user: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const addOneMonth = () => {
    const d = new Date();
    d.setMonth(d.setMonth(d.getMonth() + 1));
    const input = document.getElementById("planExpireDate") as HTMLInputElement;
    if (input) input.value = d.toISOString().split("T")[0];
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      await updateUserDetails(user.id, formData);
      router.push("/admin/billing");
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Error updating user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="glass-card p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            {/* Identity Group */}
            <div className="space-y-4">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Үндсэн мэдээлэл</label>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <UserIcon size={16} className="text-indigo-400" /> Хэрэглэгчийн нэр
                </label>
                <input 
                  name="name"
                  type="text"
                  required
                  defaultValue={user.name}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-4 text-white focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300">Нууц үг шинэчлэх (Хоосон орхиж болно)</label>
                <input 
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-4 text-white focus:border-indigo-500 outline-none transition-all"
                  placeholder="Шинэ нууц үг..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-indigo-400" /> Системийн эрх (Role)
                </label>
                <select 
                  name="role" 
                  defaultValue={user.role}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-4 text-white focus:border-indigo-500 outline-none appearance-none"
                >
                  <option value="user" className="bg-slate-900">Standard User</option>
                  <option value="content_admin" className="bg-slate-900">Content Admin</option>
                  <option value="billing_admin" className="bg-slate-900">Billing Admin</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Subscription Group */}
            <div className="space-y-4">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Багц & Эрх</label>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <PlanIcon size={16} className="text-emerald-400" /> Сонгосон багц
                </label>
                <select 
                  name="plan" 
                  defaultValue={user.plan}
                  className="w-full bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 text-white focus:border-emerald-500 outline-none appearance-none font-bold"
                >
                  <option value="none" className="bg-slate-900">None (Free Tier)</option>
                  <option value="plus" className="bg-slate-900">QuizPro Plus (3 devices)</option>
                  <option value="pro" className="bg-slate-900">QuizPro Pro (5 devices)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <Smartphone size={16} className="text-emerald-400" /> Төхөөрөмжийн хязгаар
                </label>
                <input 
                  name="maxDevices"
                  type="number"
                  min="1"
                  defaultValue={user.maxDevices || 1}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-4 text-white focus:border-emerald-500 outline-none transition-all font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <Calendar size={16} className="text-emerald-400" /> Дуусах огноо
                </label>
                <div className="flex gap-2">
                  <input 
                    name="planExpireDate"
                    id="planExpireDate"
                    type="date"
                    defaultValue={user.planExpireDate ? user.planExpireDate.toISOString().split("T")[0] : ""}
                    className="flex-1 bg-slate-900/50 border border-white/10 rounded-xl p-4 text-white focus:border-emerald-500 outline-none transition-all"
                  />
                  <button 
                    type="button"
                    onClick={addOneMonth}
                    className="px-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition-all uppercase tracking-tighter"
                  >
                    +1 Сарын сунгалт
                  </button>
                </div>
                <p className="text-[10px] text-slate-500">Хоосон орхивол хугацаагүй байна.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Link 
          href="/admin/billing"
          className="px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all"
        >
          Цуцлах
        </Link>
        <button 
          type="submit"
          disabled={loading}
          className={`px-12 py-3 rounded-xl bg-indigo-500 text-white font-bold shadow-xl shadow-indigo-500/20 transition-all hover:bg-indigo-600 flex items-center gap-2 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <Save size={20} />
          {loading ? "Хадгалж байна..." : "Хэрэглэгчийг шинэчлэх"}
        </button>
      </div>
    </form>
  );
}
