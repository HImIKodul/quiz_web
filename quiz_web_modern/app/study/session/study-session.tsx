"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  XCircle,
  Eye,
  Info,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function StudySession({ questions }: { questions: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const router = useRouter();

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const handleSelect = (letter: string) => {
    if (showAnswer) return;
    setSelectedAnswer(letter);
  };

  const checkAnswer = () => {
    setShowAnswer(true);
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowAnswer(false);
    }
  };

  const prevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSelectedAnswer(null);
      setShowAnswer(false);
    }
  };

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center">
        <Info className="text-slate-500" size={48} />
        <h2 className="text-xl text-white">Энэ сэдэвт асуулт байхгүй байна.</h2>
        <button onClick={() => router.push("/study")} className="text-primary font-bold">Буцах</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between glass-card p-6 sticky top-4 z-10 backdrop-blur-2xl">
         <div className="flex items-center gap-4">
            <button onClick={() => router.push("/study")} className="p-2 hover:bg-white/5 rounded-lg text-slate-400">
               <X size={20} />
            </button>
            <div className="h-8 w-[1px] bg-white/10" />
            <div className="space-y-0.5">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Study Mode</span>
               <p className="text-lg font-bold text-white tracking-tighter">
                 {currentIndex + 1} <span className="text-slate-700">/</span> {questions.length}
               </p>
            </div>
         </div>
         <div className="h-2 w-32 bg-slate-900 rounded-full overflow-hidden">
            <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${progress}%` }}
               className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
            />
         </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className="space-y-8"
        >
          <div className="glass-card p-8 md:p-12 space-y-6">
            <h2 className="text-2xl md:text-3xl font-medium text-white leading-relaxed">
              {currentQuestion.questionText}
            </h2>
            {currentQuestion.imageFilename && (
              <div className="rounded-2xl overflow-hidden border border-white/5 max-w-2xl mx-auto">
                <img src={`/uploads/${currentQuestion.imageFilename}`} alt="Question" className="w-full h-auto" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4">
            {["optionA", "optionB", "optionC", "optionD", "optionE", "optionF"].map((optKey) => {
              const optionText = currentQuestion[optKey];
              if (!optionText) return null;
              const letter = optKey.slice(-1);
              const isCorrect = letter === currentQuestion.correctAnswer;
              const isSelected = selectedAnswer === letter;

              let statusClasses = "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-600";
              
              if (showAnswer) {
                 if (isCorrect) statusClasses = "bg-emerald-500/20 border-emerald-500 text-emerald-400";
                 else if (isSelected) statusClasses = "bg-red-500/20 border-red-500 text-red-400";
              } else if (isSelected) {
                 statusClasses = "bg-indigo-500/20 border-indigo-500 text-white";
              }

              return (
                <button
                  key={optKey}
                  onClick={() => handleSelect(letter)}
                  className={cn("flex items-center gap-4 p-5 rounded-2xl border transition-all text-left", statusClasses)}
                >
                  <div className={cn(
                    "h-10 w-10 flex items-center justify-center rounded-xl font-bold transition-all",
                    isSelected || (showAnswer && isCorrect) ? "bg-white/10" : "bg-slate-800 text-slate-500"
                  )}>
                    {letter}
                  </div>
                  <span className="flex-1 font-medium">{optionText}</span>
                  {showAnswer && isCorrect && <CheckCircle2 className="text-emerald-500" size={20} />}
                  {showAnswer && isSelected && !isCorrect && <XCircle className="text-red-500" size={20} />}
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-background/80 backdrop-blur-xl border-t border-white/5 z-20">
         <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
               <button
                 onClick={prevQuestion}
                 disabled={currentIndex === 0}
                 className="p-3 rounded-xl border border-white/10 text-slate-400 hover:bg-white/5 disabled:opacity-0 transition-all"
               >
                 <ChevronLeft size={24} />
               </button>
               <button
                 onClick={nextQuestion}
                 disabled={currentIndex === questions.length - 1}
                 className="p-3 rounded-xl border border-white/10 text-slate-400 hover:bg-white/5 disabled:opacity-0 transition-all"
               >
                 <ChevronRight size={24} />
               </button>
            </div>

            <div className="flex items-center gap-4">
               {!showAnswer ? (
                 <button
                   onClick={checkAnswer}
                   disabled={!selectedAnswer}
                   className="px-8 py-3 bg-white text-slate-900 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-100 disabled:opacity-50 transition-all"
                 >
                   <Eye size={18} /> Хариулт харах
                 </button>
               ) : (
                 <button
                   onClick={nextQuestion}
                   className="px-8 py-3 premium-gradient text-white rounded-xl font-bold flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
                 >
                   Дараагийн асуулт <ChevronRight size={18} />
                 </button>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}
