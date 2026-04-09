"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile } from "fs/promises";
import path from "path";
import bcrypt from "bcryptjs";

async function checkAdmin(requiredRole: "content_admin" | "billing_admin" | "any" = "any") {
  const session = await getServerSession(authOptions);
  if (!session) return null;
  
  if (requiredRole === "any") {
    if (session.user.role === "content_admin" || session.user.role === "billing_admin") return session;
  } else if (session.user.role === requiredRole) {
    return session;
  }
  
  return null;
}

// QUESTION ACTIONS
export async function createQuestion(formData: FormData) {
  const session = await checkAdmin("content_admin");
  if (!session) throw new Error("Unauthorized");

  const qType = formData.get("qType") as string;
  const questionText = formData.get("questionText") as string;
  const topic = formData.get("topic") as string;
  const correctAnswer = formData.get("correctAnswer") as string;
  
  const optionA = formData.get("optionA") as string || null;
  const optionB = formData.get("optionB") as string || null;
  const optionC = formData.get("optionC") as string || null;
  const optionD = formData.get("optionD") as string || null;
  const optionE = formData.get("optionE") as string || null;
  const optionF = formData.get("optionF") as string || null;

  const imageFile = formData.get("image") as File;
  let imageFilename = null;

  if (imageFile && imageFile.size > 0) {
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    imageFilename = `${Date.now()}-${imageFile.name}`;
    const uploadPath = path.join(process.cwd(), "public", "uploads", imageFilename);
    await writeFile(uploadPath, buffer);
  }

  await prisma.question.create({
    data: {
      qType,
      questionText,
      topic,
      correctAnswer,
      optionA,
      optionB,
      optionC,
      optionD,
      optionE,
      optionF,
      imageFilename,
      createdBy: session.user.identifier,
    },
  });

  revalidatePath("/admin/content");
  return { success: true };
}

export async function updateQuestion(id: number, formData: FormData) {
  const session = await checkAdmin("content_admin");
  if (!session) throw new Error("Unauthorized");

  const questionText = formData.get("questionText") as string;
  const topic = formData.get("topic") as string;
  const correctAnswer = formData.get("correctAnswer") as string;
  
  const optionA = formData.get("optionA") as string || null;
  const optionB = formData.get("optionB") as string || null;
  const optionC = formData.get("optionC") as string || null;
  const optionD = formData.get("optionD") as string || null;
  const optionE = formData.get("optionE") as string || null;
  const optionF = formData.get("optionF") as string || null;

  const removeImage = formData.get("removeImage") === "true";
  const imageFile = formData.get("image") as File;
  
  const existing = await prisma.question.findUnique({ where: { id } });
  let imageFilename = existing?.imageFilename;

  if (removeImage) {
    imageFilename = null;
  }

  if (imageFile && imageFile.size > 0) {
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    imageFilename = `${Date.now()}-${imageFile.name}`;
    const uploadPath = path.join(process.cwd(), "public", "uploads", imageFilename);
    await writeFile(uploadPath, buffer);
  }

  await prisma.question.update({
    where: { id },
    data: {
      questionText,
      topic,
      correctAnswer,
      optionA,
      optionB,
      optionC,
      optionD,
      optionE,
      optionF,
      imageFilename,
    },
  });

  revalidatePath("/admin/content");
  return { success: true };
}

export async function deleteQuestion(id: number) {
  const session = await checkAdmin("content_admin");
  if (!session) throw new Error("Unauthorized");

  await prisma.question.delete({ where: { id } });

  revalidatePath("/admin/content");
  return { success: true };
}

// USER ACTIONS
export async function updateUserDetails(id: number, formData: FormData) {
  const session = await checkAdmin("billing_admin");
  if (!session) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const role = formData.get("role") as string;
  const plan = formData.get("plan") as string;
  const maxDevices = parseInt(formData.get("maxDevices") as string);
  const planExpireDateRaw = formData.get("planExpireDate") as string;
  const password = formData.get("password") as string;

  const data: any = {
    name,
    role,
    plan,
    maxDevices,
    planExpireDate: planExpireDateRaw ? new Date(planExpireDateRaw) : null,
  };

  if (password && password.trim().length > 0) {
    data.passwordHash = await bcrypt.hash(password, 10);
  }

  await prisma.user.update({
    where: { id },
    data,
  });

  revalidatePath("/admin/billing");
  return { success: true };
}
