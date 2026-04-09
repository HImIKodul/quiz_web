import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "content_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as Blob;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    let importCount = 0;

    // Helper to extract option (handles different Excel mappings)
    const getVal = (row: any, keys: string[]) => {
      for (const key of keys) {
        if (row[key] !== undefined) return String(row[key]);
      }
      return null;
    };

    const questionsToCreate = data.map((row: any) => {
      importCount++;
      return {
        questionText: getVal(row, ["Question", "Асуулт", "text"]) || "No text",
        optionA: getVal(row, ["A", "Option A", "Хувилбар A"]),
        optionB: getVal(row, ["B", "Option B", "Хувилбар B"]),
        optionC: getVal(row, ["C", "Option C", "Хувилбар C"]),
        optionD: getVal(row, ["D", "Option D", "Хувилбар D"]),
        optionE: getVal(row, ["E", "Option E", "Хувилбар E"]),
        optionF: getVal(row, ["F", "Option F", "Хувилбар F"]),
        correctAnswer: getVal(row, ["Correct", "Зөв хариулт", "answer"]) || "A",
        topic: getVal(row, ["Topic", "Сэдэв"]) || "Imported",
        createdBy: session.user.email,
        qType: "mcq",
      };
    });

    await prisma.question.createMany({
      data: questionsToCreate,
    });

    // Log the action
    await prisma.activityLog.create({
      data: {
        userId: parseInt(session.user.id),
        userIdentifier: session.user.email,
        action: "bulk_import",
        details: `${importCount} questions imported from Excel`,
      },
    });

    return NextResponse.json({ success: true, count: importCount });
  } catch (error: any) {
    console.error("XLSX import error:", error);
    return NextResponse.json(
      { error: "Excel файл уншихад алдаа гарлаа. Файлын бүтцийг шалгана уу." },
      { status: 500 }
    );
  }
}
