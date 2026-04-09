import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import StudySession from "./study-session";

export default async function StudySessionPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { topic } = await searchParams;
  const topicFilter = topic && topic !== "all" ? topic : undefined;

  const questions = await prisma.question.findMany({
    where: topicFilter ? { topic: topicFilter } : {},
    orderBy: { id: "asc" }, // In study mode, sequential might be better or random
  });

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <StudySession questions={questions} />
    </div>
  );
}
