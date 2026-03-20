"use server";

import { Prisma, Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireDatabaseUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { calculatePercentage } from "@/lib/grades";
import { buildStatusUrl } from "@/lib/utils";

function getRedirectTo(formData: FormData, fallback: string) {
  return String(formData.get("redirectTo") || fallback);
}

export async function saveJournalGradesAction(formData: FormData) {
  const teacher = await requireDatabaseUser([Role.TEACHER]);
  const redirectTo = getRedirectTo(formData, "/en/dashboard/teacher/journals");
  const classId = String(formData.get("classId") || "").trim();
  const subjectId = String(formData.get("subjectId") || "").trim();
  const quarter = Number(String(formData.get("quarter") || "").trim());

  if (!classId || !subjectId || ![1, 2, 3, 4].includes(quarter)) {
    redirect(buildStatusUrl(redirectTo, { error: "Class, subject, and quarter are required." }));
  }

  const assignment = await prisma.teacherAssignment.findFirst({
    where: {
      teacherId: teacher.id,
      classId,
      subjectId,
    },
  });

  if (!assignment) {
    redirect(buildStatusUrl(redirectTo, { error: "You can only edit your assigned class and subject pairs." }));
  }

  const [students, assessments] = await Promise.all([
    prisma.studentProfile.findMany({
      where: { classId },
      include: { user: true },
    }),
    prisma.assessment.findMany({
      where: { classId, subjectId, quarter },
      orderBy: [{ type: "asc" }, { number: "asc" }],
    }),
  ]);

  const studentIds = new Set(students.map((student) => student.id));
  const assessmentMap = new Map(assessments.map((assessment) => [assessment.id, assessment]));
  const operations: Prisma.PrismaPromise<unknown>[] = [];

  for (const [key, rawValue] of formData.entries()) {
    if (!key.startsWith("grade:")) {
      continue;
    }

    const [, studentId, assessmentId] = key.split(":");

    if (!studentIds.has(studentId) || !assessmentMap.has(assessmentId)) {
      redirect(buildStatusUrl(redirectTo, { error: "Invalid journal payload detected." }));
    }

    const value = String(rawValue).trim();

    if (!value) {
      operations.push(
        prisma.grade.deleteMany({
          where: {
            studentId,
            assessmentId,
          },
        }),
      );
      continue;
    }

    const score = Number(value);
    const assessment = assessmentMap.get(assessmentId)!;

    if (!Number.isFinite(score) || score < 0 || score > assessment.maxScore) {
      redirect(
        buildStatusUrl(redirectTo, {
          error: `Scores must be between 0 and ${assessment.maxScore}.`,
        }),
      );
    }

    operations.push(
      prisma.grade.upsert({
        where: {
          studentId_assessmentId: {
            studentId,
            assessmentId,
          },
        },
        update: {
          score,
          percentage: calculatePercentage(score, assessment.maxScore),
        },
        create: {
          studentId,
          assessmentId,
          score,
          percentage: calculatePercentage(score, assessment.maxScore),
        },
      }),
    );
  }

  await prisma.$transaction(operations);
  revalidatePath("/en/dashboard/teacher/journals");
  revalidatePath("/en/dashboard/teacher/quarter-results");
  revalidatePath("/en/dashboard/student");
  redirect(buildStatusUrl(redirectTo, { success: "Grades saved." }));
}
