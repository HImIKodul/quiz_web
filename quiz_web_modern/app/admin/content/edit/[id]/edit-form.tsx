"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Save, 
  Image as ImageIcon, 
  X,
} from "lucide-react";
import Link from "next/link";
import { updateQuestion } from "@/lib/actions/admin";

export default function EditQuestionForm({ question }: { question: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(
    question.imageFilename ? `/uploads/${question.imageFilename}` : null
  );
  const [removeImage, setRemoveImage] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRemoveImage(false);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("removeImage", removeImage.toString());

    // Handle special types for correctAnswer
    if (question.qType === "multi_select") {
      const selected = Array.from(formData.getAll("msCorrect")).join(",");
      formData.set("correctAnswer", selected);
    } else if (question.qType === "matching") {
      const pairs = [];
      for (let i = 1; i <= 6; i++) {
        const p = formData.get(`match${i}`) as string;
        if (p && p.includes("=")) pairs.push(p);
      }
      formData.set("correctAnswer", pairs.join("|"));
    }

    try {
      await updateQuestion(question.id, formData);
      router.push("/admin/content");
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Error updating question");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="glass-card p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300">Асуултын текст</label>
              <textarea 
                name="questionText"
                required
                defaultValue={question.questionText}
                rows={4}
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-4 text-white focus:border-indigo-500 outline-none transition-all resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300">Сэдэв (Topic)</label>
              <input 
                name="topic"
                type="text"
                defaultValue={question.topic}
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-4 text-white focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300">Зураг засах</label>
              <div className="relative group">
                <input 
                  type="file" 
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 transition-all ${removeImage ? "border-red-500/50 bg-red-500/5" : "border-white/10 group-hover:border-indigo-500/50 group-hover:bg-indigo-500/5"}`}>
                  {imagePreview && !removeImage ? (
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-white/10">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setRemoveImage(true);
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-full text-white shadow-lg"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className={`p-4 rounded-full ${removeImage ? "bg-red-500/10 text-red-400" : "bg-indigo-500/10 text-indigo-400"}`}>
                        <ImageIcon size={32} />
                      </div>
                      <p className="text-sm text-slate-400">{removeImage ? "Зураггүй хадгалах уу?" : "Зураг солих бол энд дарна уу"}</p>
                      {removeImage && (
                        <button 
                          type="button" 
                          onClick={() => setRemoveImage(false)}
                          className="text-xs text-indigo-400 font-bold uppercase tracking-wider underline mt-2"
                        >
                          Зургийг хэвээр үлдээх
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {question.qType === "mcq" && (
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
                        defaultValue={question[`option${opt}`]}
                        className="flex-1 bg-slate-900/50 border border-white/10 rounded-lg px-4 text-sm text-white focus:border-indigo-500 outline-none"
                      />
                    </div>
                  ))}
                </div>
                <div className="pt-4 space-y-2">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Зөв хувилбар</label>
                   <select 
                    name="correctAnswer" 
                    defaultValue={question.correctAnswer}
                    className="w-full bg-indigo-500/10 border border-indigo-500/50 rounded-xl p-4 text-white focus:border-indigo-500 outline-none appearance-none font-bold"
                   >
                     {["A", "B", "C", "D", "E", "F"].map(v => <option key={v} value={v} className="bg-slate-900">Хувилбар {v}</option>)}
                   </select>
                </div>
              </div>
            )}

            {question.qType === "tf" && (
              <div className="space-y-4">
                 <label className="text-sm font-semibold text-slate-300">Зөв хариулт</label>
                 <div className="grid grid-cols-2 gap-4">
                    {["True", "False"].map(v => (
                      <label key={v} className="cursor-pointer group">
                         <input 
                          type="radio" 
                          name="correctAnswer" 
                          value={v} 
                          defaultChecked={question.correctAnswer === v} 
                          className="hidden peer" 
                         />
                         <div className="p-6 rounded-xl border border-white/10 bg-white/5 text-center transition-all peer-checked:bg-emerald-500/20 peer-checked:border-emerald-500 peer-checked:text-emerald-400 group-hover:bg-white/10">
                            <span className="font-bold">{v === "True" ? "Үнэн" : "Худал"}</span>
                         </div>
                      </label>
                    ))}
                 </div>
              </div>
            )}

            {question.qType === "numeric" && (
               <div className="space-y-4">
                  <label className="text-sm font-semibold text-slate-300">Тоон зөв хариулт</label>
                  <input 
                    name="correctAnswer"
                    type="number"
                    step="any"
                    required
                    defaultValue={question.correctAnswer}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-4 text-white focus:border-indigo-500 outline-none transition-all font-mono"
                  />
               </div>
            )}

            {question.qType === "matching" && (
               <div className="space-y-4">
                  <label className="text-sm font-semibold text-slate-300">Тохирох хосууд (Format: A=B)</label>
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => {
                      const letters = ["A", "B", "C", "D", "E", "F"];
                      return (
                         <input 
                            key={i}
                            name={`match${i}`}
                            type="text"
                            defaultValue={question[`option${letters[i-1]}`]}
                            className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-indigo-500 outline-none"
                         />
                      );
                    })}
                  </div>
               </div>
            )}

            {question.qType === "multi_select" && (
              <div className="space-y-4">
                <label className="text-sm font-semibold text-slate-300">Хэд хэдэн зөв хариулт сонгох хариултууд</label>
                <div className="space-y-3">
                  {["A", "B", "C", "D", "E", "F"].map((opt) => (
                    <div key={opt} className="flex gap-3 items-center">
                      <input 
                        type="checkbox" 
                        name="msCorrect" 
                        value={opt} 
                        defaultChecked={question.correctAnswer.split(",").includes(opt)}
                        className="w-5 h-5 rounded border-white/10 bg-white/5 text-indigo-500 focus:ring-indigo-500"
                      />
                      <input 
                        name={`option${opt}`}
                        type="text"
                        defaultValue={question[`option${opt}`]}
                        className="flex-1 bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                      />
                    </div>
                  ))}
                </div>
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
          {loading ? "Хадгалж байна..." : "Өөрчлөлтийг хадгалах"}
        </button>
      </div>
    </form>
  );
}
