"use client";

import { useTransition, useState } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Image as ImageIcon,
  FileSpreadsheet,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteQuestion } from "@/lib/actions/admin";

export default function ContentAdminClient({
  questions,
  topics,
  searchParams,
}: {
  questions: any[];
  topics: string[];
  searchParams: { topic?: string; q?: string };
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState(searchParams.q || "");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(window.location.search);
    if (searchTerm) params.set("q", searchTerm);
    else params.delete("q");
    router.push(`/admin/content?${params.toString()}`);
  };

  const handleTopicChange = (topic: string) => {
    const params = new URLSearchParams(window.location.search);
    if (topic) params.set("topic", topic);
    else params.delete("topic");
    router.push(`/admin/content?${params.toString()}`);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Энэ асуултыг устгахдаа итгэлтэй байна уу?")) return;
    
    startTransition(async () => {
      try {
        await deleteQuestion(id);
        router.refresh();
      } catch (err) {
        alert("Алдаа гарлаа");
      }
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Асуулт удирдах</h1>
          <p className="text-slate-400 mt-1">Нийт {questions.length} асуулт бүртгэлтэй байна.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20 font-semibold hover:bg-emerald-500/20 transition-all">
            <FileSpreadsheet size={18} /> Excel-ээр оруулах
          </button>
          <Link 
            href="/admin/content/new" 
            className="premium-gradient flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-105"
          >
            <Plus size={18} /> Шинэ асуулт
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <form onSubmit={handleSearch} className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Асуултын текстээр хайх..." 
            className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-indigo-500 outline-none transition-all"
          />
        </form>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <select 
            value={searchParams.topic || ""}
            onChange={(e) => handleTopicChange(e.target.value)}
            className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:border-indigo-500 outline-none appearance-none transition-all"
          >
            <option value="">Бүх сэдэв</option>
            {topics.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* Questions Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/5 text-xs font-bold text-slate-500 uppercase tracking-widest">
                <th className="px-6 py-4">Асуулт</th>
                <th className="px-6 py-4">Сэдэв</th>
                <th className="px-6 py-4 text-right">Үйлдэл</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {questions.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                    Асуулт олдсонгүй.
                  </td>
                </tr>
              ) : (
                questions.map((q) => (
                  <tr key={q.id} className="group hover:bg-white/5 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-start gap-3">
                         {q.imageFilename && <ImageIcon size={16} className="text-indigo-400 mt-1 shrink-0" />}
                         <div className="space-y-1">
                           <p className="text-sm text-slate-200 line-clamp-2">{q.questionText}</p>
                           <div className="flex items-center gap-2">
                             <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">{q.qType}</span>
                             <span className="text-[10px] text-slate-500">•</span>
                             <span className="text-[10px] text-emerald-400/70 font-bold max-w-[200px] truncate">{q.correctAnswer}</span>
                           </div>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="px-2 py-1 rounded-md bg-white/5 text-slate-400 text-[10px] font-bold uppercase truncate max-w-[120px] inline-block">
                        {q.topic || "—"}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/admin/content/edit/${q.id}`}
                          className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                        >
                          <Edit2 size={16} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(q.id)}
                          disabled={isPending}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all disabled:opacity-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
