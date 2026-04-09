import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import QuizSession from "./quiz-session";

export default async function QuizPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string; count?: string; timer?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.plan === "none") redirect("/subscriptions");

  const { topic, count, timer } = await searchParams;

  const topicFilter = topic && topic !== "all" ? topic : undefined;
  const limit = count && count !== "all" ? parseInt(count) : undefined;

  // Fetch questions
  const questions = await prisma.question.findMany({
    where: topicFilter ? { topic: topicFilter } : {},
    take: limit,
  });

  // Shuffle questions
  const shuffledQuestions = questions.sort(() => Math.random() - 0.5);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <QuizSession 
        questions={shuffledQuestions} 
        initialTimer={timer ? parseInt(timer) : 0} 
      />
    </div>
  );
}
