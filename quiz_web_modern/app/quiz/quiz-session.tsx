"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  AlertCircle,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Question {
  id: number;
  qType: string;
  questionText: string;
  optionA: string | null;
  optionB: string | null;
  optionC: string | null;
  optionD: string | null;
  optionE: string | null;
  optionF: string | null;
  correctAnswer: string;
  imageFilename: string | null;
  topic: string | null;
}

export default function QuizSession({ 
  questions, 
  initialTimer 
}: { 
  questions: any[]; 
  initialTimer: number; 
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(initialTimer);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  // Timer logic
  useEffect(() => {
    if (initialTimer === 0) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, initialTimer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswer = (answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: answer,
    }));
  };

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers,
          questions: questions.map(q => ({ id: q.id, correctAnswer: q.correctAnswer })),
        }),
      });

      const result = await response.json();
      if (response.ok) {
        router.push(`/result/${result.attemptId}`);
      } else {
        alert("Хариулт хадгалахад алдаа гарлаа.");
      }
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [answers, questions, router]);

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <AlertCircle className="text-slate-500" size={48} />
        <h2 className="text-xl text-white">Асуулт олдсонгүй.</h2>
        <button onClick={() => router.back()} className="text-primary">Буцах</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header with Stats */}
      <div className="flex items-center justify-between glass-card p-6 sticky top-4 z-10 backdrop-blur-2xl">
        <div className="flex items-center gap-6">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Асуулт</span>
            <p className="text-xl font-bold text-white tracking-tighter">
              {currentIndex + 1} <span className="text-slate-600">/</span> {questions.length}
            </p>
          </div>
          {initialTimer > 0 && (
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Хугацаа</span>
              <div className={cn(
                "flex items-center gap-2 text-xl font-bold tracking-tighter tabular-nums",
                timeLeft < 60 ? "text-red-400 animate-pulse" : "text-emerald-400"
              )}>
                <Clock size={20} />
                {formatTime(timeLeft)}
              </div>
            </div>
          )}
        </div>

        <button 
          onClick={handleSubmit} 
          disabled={isSubmitting}
          className="premium-gradient flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white shadow-lg shadow-indigo-500/20 hover:scale-105 transition-all disabled:opacity-50"
        >
          {isSubmitting ? "Хадгалж байна..." : "Дуусгах"} <Send size={18} />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full premium-gradient"
        />
      </div>

      {/* Question Section */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
        >
          <div className="glass-card p-8 md:p-12 space-y-6">
            {currentQuestion.topic && (
              <span className="inline-block px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                {currentQuestion.topic}
              </span>
            )}
            <h2 className="text-2xl md:text-3xl font-medium text-white leading-relaxed">
              {currentQuestion.questionText}
            </h2>

            {currentQuestion.imageFilename && (
              <div className="rounded-2xl overflow-hidden border border-white/5 max-w-2xl">
                <img 
                  src={`/uploads/${currentQuestion.imageFilename}`} 
                  alt="Question" 
                  className="w-full h-auto"
                />
              </div>
            )}
          </div>

          {/* Options Section */}
          <div className="grid grid-cols-1 gap-4">
            {["optionA", "optionB", "optionC", "optionD", "optionE", "optionF"].map((optKey, idx) => {
              const optionText = currentQuestion[optKey];
              if (!optionText) return null;
              const optionLetter = optKey.slice(-1);
              const isSelected = answers[currentQuestion.id] === optionLetter;

              return (
                <button
                  key={optKey}
                  onClick={() => handleAnswer(optionLetter)}
                  className={cn(
                    "flex items-center gap-4 p-5 rounded-2xl border transition-all text-left group",
                    isSelected 
                      ? "bg-primary border-primary text-white shadow-xl shadow-primary/20" 
                      : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-600 hover:bg-slate-800/50"
                  )}
                >
                  <div className={cn(
                    "h-10 w-10 flex items-center justify-center rounded-xl font-bold transition-colors",
                    isSelected ? "bg-white/20 text-white" : "bg-slate-800 text-slate-500 group-hover:bg-slate-700"
                  )}>
                    {optionLetter}
                  </div>
                  <span className="flex-1 font-medium">{optionText}</span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between py-10">
        <button
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 px-6 py-3 rounded-xl border border-white/5 text-slate-400 hover:bg-white/5 disabled:opacity-0 transition-all font-semibold"
        >
          <ChevronLeft size={20} /> Өмнөх
        </button>
        <button
          onClick={() => {
            if (currentIndex < questions.length - 1) {
              setCurrentIndex(currentIndex + 1);
            } else {
              handleSubmit();
            }
          }}
          className="flex items-center gap-2 px-8 py-3 rounded-xl bg-white text-slate-900 font-bold hover:bg-slate-100 transition-all active:scale-95 shadow-lg"
        >
          {currentIndex === questions.length - 1 ? "Дуусгах" : "Дараах"} 
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
