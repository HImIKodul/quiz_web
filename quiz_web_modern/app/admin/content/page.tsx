import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { redirect } from "next/navigation";
import ContentAdminClient from "./content-client";

export default async function ContentAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string; q?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "content_admin") {
    redirect("/dashboard");
  }

  const { topic, q } = await searchParams;

  const questions = await prisma.question.findMany({
    where: {
      AND: [
        topic ? { topic: topic } : {},
        q ? { questionText: { contains: q } } : {},
      ]
    },
    orderBy: { createdAt: "desc" },
  });

  const topics = Array.from(new Set(questions.map(q => q.topic).filter(Boolean))) as string[];

  return (
    <DashboardLayout>
      <ContentAdminClient 
        questions={questions} 
        topics={topics} 
        searchParams={{ topic, q }} 
      />
    </DashboardLayout>
  );
}
