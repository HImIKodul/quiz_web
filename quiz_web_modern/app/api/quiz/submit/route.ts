import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { answers, questions } = await req.json();
    const userId = parseInt(session.user.id);

    let correctCount = 0;
    const totalQuestions = questions.length;

    // First, create the QuizAttempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId,
        totalQuestions,
        correctAnswers: 0, // Will update later
        scorePercent: 0,   // Will update later
      },
    });

    // Create details and calculate score
    const detailsData = questions.map((q: any) => {
      const userAnswer = answers[q.id] || "";
      const isCorrect = userAnswer === q.correctAnswer;
      if (isCorrect) correctCount++;

      return {
        attemptId: attempt.id,
        questionText: "Question Details", // We could fetch actual text but let's keep it lean for now
        userAnswer,
        correctAnswer: q.correctAnswer,
        isCorrect,
      };
    });

    await prisma.quizAttemptDetail.createMany({
      data: detailsData,
    });

    // Update Attempt with final scores
    const scorePercent = Math.round((correctCount / totalQuestions) * 100);
    await prisma.quizAttempt.update({
      where: { id: attempt.id },
      data: {
        correctAnswers: correctCount,
        scorePercent,
      },
    });

    return NextResponse.json({ success: true, attemptId: attempt.id });
  } catch (error: any) {
    console.error("Quiz submission error:", error);
    return NextResponse.json(
      { error: "Шалгалтын дүнг хадгалахад алдаа гарлаа." },
      { status: 500 }
    );
  }
}
