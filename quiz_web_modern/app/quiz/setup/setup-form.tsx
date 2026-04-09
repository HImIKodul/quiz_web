"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, List, Clock, Play } from "lucide-react";
import { motion } from "framer-motion";

export default function QuizSetupForm({ topics }: { topics: string[] }) {
  const [topic, setTopic] = useState("all");
  const [count, setCount] = useState("10");
  const [timer, setTimer] = useState("1200"); // 20 mins default
  const router = useRouter();

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/quiz?topic=${encodeURIComponent(topic)}&count=${count}&timer=${timer}`);
  };

  return (
    <form onSubmit={handleStart} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Topic Selection */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-400 uppercase tracking-wider">
            <BookOpen size={16} /> Төрөл
          </label>
          <select 
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none"
          >
            <option value="all">Бүх асуулт</option>
            {topics.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Question Count */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-400 uppercase tracking-wider">
            <List size={16} /> Асуултын тоо
          </label>
          <select 
            value={count}
            onChange={(e) => setCount(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none"
          >
            <option value="10">10 Асуулт</option>
            <option value="20">20 Асуулт</option>
            <option value="40">40 Асуулт</option>
            <option value="60">60 Асуулт</option>
            <option value="all">Бүгд</option>
          </select>
        </div>

        {/* Timer */}
        <div className="space-y-3 md:col-span-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-400 uppercase tracking-wider">
            <Clock size={16} /> Хугацаа
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Хугацаагүй", value: "0" },
              { label: "10 минут", value: "600" },
              { label: "20 минут", value: "1200" },
              { label: "30 минут", value: "1800" },
              { label: "45 минут", value: "2700" },
              { label: "60 минут", value: "3600" },
            ].map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setTimer(t.value)}
                className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                  timer === t.value 
                    ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                    : "bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        type="submit"
        className="w-full premium-gradient flex items-center justify-center gap-3 py-5 rounded-2xl text-lg font-bold text-white shadow-xl shadow-indigo-500/20 mt-10"
      >
        <Play fill="currentColor" size={20} />
        Шалгалт эхлэх
      </motion.button>
    </form>
  );
}
