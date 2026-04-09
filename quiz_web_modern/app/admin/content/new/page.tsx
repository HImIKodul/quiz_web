"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { 
  ArrowLeft, 
  Save, 
  Image as ImageIcon, 
  X,
  Type,
  CheckCircle2,
  Hash,
  LayoutGrid,
  ListTodo
} from "lucide-react";
import Link from "next/link";
import { createQuestion } from "@/lib/actions/admin";

const QUESTION_TYPES = [
  { id: "mcq", label: "Multiple Choice", icon: Type },
  { id: "multi_select", label: "Multi-Select", icon: ListTodo },
  { id: "tf", label: "True / False", icon: CheckCircle2 },
  { id: "numeric", label: "Numeric", icon: Hash },
  { id: "matching", label: "Matching Pairs", icon: LayoutGrid },
];

export default function NewQuestionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [qType, setQType] = useState("mcq");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("qType", qType);

    // Handle special types for correctAnswer
    if (qType === "multi_select") {
      const selected = Array.from(formData.getAll("msCorrect")).join(",");
      formData.set("correctAnswer", selected);
    } else if (qType === "matching") {
      const pairs = [];
      for (let i = 1; i <= 6; i++) {
        const p = formData.get(`match${i}`) as string;
        if (p && p.includes("=")) pairs.push(p);
      }
      formData.set("correctAnswer", pairs.join("|"));
    }

    try {
      await createQuestion(formData);
      router.push("/admin/content");
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Error creating question");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/content"
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Шинэ асуулт нэмэх</h1>
            <p className="text-slate-400 mt-1">Асуултын өгөгдлийг гараар оруулах</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="glass-card p-8 space-y-8">
            {/* Question Type Selection */}
            <div className="space-y-4">
              <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Асуултын төрөл</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {QUESTION_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setQType(type.id)}
                      className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all ${
                        qType === type.id 
                          ? "bg-indigo-500/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/20" 
                          : "bg-white/5 border-white/10 text-slate-500 hover:bg-white/10 hover:border-white/20"
                      }`}
                    >
                      <Icon size={24} />
                      <span className="text-xs font-bold">{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-300">Асуултын текст</label>
                  <textarea 
                    name="questionText"
                    required
                    rows={4}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-4 text-white focus:border-indigo-500 outline-none transition-all resize-none"
                    placeholder="Асуултаа энд бичнэ үү..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-300">Сэдэв (Topic)</label>
                  <input 
                    name="topic"
                    type="text"
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-4 text-white focus:border-indigo-500 outline-none transition-all"
                    placeholder="Жишээ: Математик, Түүх..."
                  />
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-300">Зураг хавсаргах</label>
                  <div className="relative group">
                    <input 
                      type="file" 
                      name="image"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center gap-3 group-hover:border-indigo-500/50 group-hover:bg-indigo-500/5 transition-all">
                      {imagePreview ? (
                        <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-white/10">
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setImagePreview(null);
                            }}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-full text-white shadow-lg"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="p-4 rounded-full bg-indigo-500/10 text-indigo-400">
                            <ImageIcon size={32} />
                          </div>
                          <p className="text-sm text-slate-400">Зураг сонгох эсвэл энд чирч оруулна уу</p>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">JPG, PNG, WEBP (Max 5MB)</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Dynamic Answer Section */}
                {qType === "mcq" && (
                  <div className="space-y-4">
                    <label className="text-sm font-semibold text-slate-300">Сонголтууд & Зөв хариулт</label>
                    <div className="space-y-3">
                      {["A", "B", "C", "D", "E", "F"].map((opt) => (
                        <div key={opt} className="flex gap-3">
                          <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 font-bold border border-indigo-500/20">
                            {opt}
                          </div>
                          <input 
                            name={`option${opt}`}
                            type="text"
                            className="flex-1 bg-slate-900/50 border border-white/10 rounded-lg px-4 text-sm text-white focus:border-indigo-500 outline-none"
                            placeholder={`${opt} хувилбар...`}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="pt-4 space-y-2">
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Зөв хувилбар</label>
                       <select name="correctAnswer" className="w-full bg-indigo-500/10 border border-indigo-500/50 rounded-xl p-4 text-white focus:border-indigo-500 outline-none appearance-none font-bold">
                         {["A", "B", "C", "D", "E", "F"].map(v => <option key={v} value={v} className="bg-slate-900">Хувилбар {v}</option>)}
                       </select>
                    </div>
                  </div>
                )}

                {qType === "tf" && (
                  <div className="space-y-4">
                     <label className="text-sm font-semibold text-slate-300">Зөв хариулт</label>
                     <div className="grid grid-cols-2 gap-4">
                        {["True", "False"].map(v => (
                          <label key={v} className="cursor-pointer group">
                             <input type="radio" name="correctAnswer" value={v} defaultChecked={v === "True"} className="hidden peer" />
                             <div className="p-6 rounded-xl border border-white/10 bg-white/5 text-center transition-all peer-checked:bg-emerald-500/20 peer-checked:border-emerald-500 peer-checked:text-emerald-400 group-hover:bg-white/10">
                                <span className="font-bold">{v === "True" ? "Үнэн" : "Худал"}</span>
                             </div>
                          </label>
                        ))}
                     </div>
                  </div>
                )}

                {qType === "numeric" && (
                   <div className="space-y-4">
                      <label className="text-sm font-semibold text-slate-300">Тоон зөв хариулт</label>
                      <input 
                        name="correctAnswer"
                        type="number"
                        step="any"
                        required
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-4 text-white focus:border-indigo-500 outline-none transition-all font-mono"
                        placeholder="Жишээ: 42.5"
                      />
                      <p className="text-xs text-slate-500">Систем хариултыг яг таг таарч байгаа эсэхийг шалгана.</p>
                   </div>
                )}

                {qType === "matching" && (
                   <div className="space-y-4">
                      <label className="text-sm font-semibold text-slate-300">Тохирох хосууд (Format: A=B)</label>
                      <div className="space-y-3">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                           <input 
                              key={i}
                              name={`match${i}`}
                              type="text"
                              className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-indigo-500 outline-none"
                              placeholder={`Хос ${i}: Өгөгдөл = Хариу`}
                           />
                        ))}
                      </div>
                      <input type="hidden" name="correctAnswer" value="matching_logic" />
                   </div>
                )}

                {qType === "multi_select" && (
                  <div className="space-y-4">
                    <label className="text-sm font-semibold text-slate-300">Хэд хэдэн зөв хариулт сонгох хариултууд</label>
                    <div className="space-y-3">
                      {["A", "B", "C", "D", "E", "F"].map((opt) => (
                        <div key={opt} className="flex gap-3 items-center">
                          <input 
                            type="checkbox" 
                            name="msCorrect" 
                            value={opt} 
                            className="w-5 h-5 rounded border-white/10 bg-white/5 text-indigo-500 focus:ring-indigo-500"
                          />
                          <input 
                            name={`option${opt}`}
                            type="text"
                            className="flex-1 bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                            placeholder={`${opt} хувилбар...`}
                          />
                        </div>
                      ))}
                    </div>
                    <input type="hidden" name="correctAnswer" value="" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Link 
              href="/admin/content"
              className="px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all"
            >
              Цуцлах
            </Link>
            <button 
              type="submit"
              disabled={loading}
              className={`premium-gradient px-12 py-3 rounded-xl text-white font-bold shadow-xl shadow-indigo-500/20 transition-all hover:scale-105 flex items-center gap-2 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Save size={20} />
              {loading ? "Хадгалж байна..." : "Асуултыг хадгалах"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
