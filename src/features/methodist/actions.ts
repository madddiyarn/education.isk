"use server";

import { AssessmentType, Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireDatabaseUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { stripSearchParams } from "@/lib/presentation";
import { buildStatusUrl } from "@/lib/utils";

function getRedirectTo(formData: FormData, fallback: string) {
  return String(formData.get("redirectTo") || fallback);
}

function revalidateMethodistPaths(redirectTo: string) {
  const basePath = stripSearchParams(redirectTo);
  const localeMatch = basePath.match(/^\/(en|ru)\//);
  const locale = localeMatch?.[1] || "en";

  revalidatePath(basePath);
  revalidatePath(`/${locale}/dashboard/methodist`);
}

function parseNumber(value: FormDataEntryValue | null) {
  return Number(String(value || "").trim());
}

export async function upsertAssessmentSettingAction(formData: FormData) {
  await requireDatabaseUser([Role.METHODIST, Role.MODERATOR]);
  const redirectTo = getRedirectTo(formData, "/en/dashboard/methodist/settings");
  const quarter = parseNumber(formData.get("quarter"));
  const subjectId = String(formData.get("subjectId") || "").trim();
  const classId = String(formData.get("classId") || "").trim();
  const sorCount = parseNumber(formData.get("sorCount"));
  const sochCount = parseNumber(formData.get("sochCount"));

  if (!subjectId || !classId || ![1, 2, 3, 4].includes(quarter)) {
    redirect(buildStatusUrl(redirectTo, { error: "Quarter, subject, and class are required." }));
  }

  if (sorCount < 0 || sochCount < 0) {
    redirect(buildStatusUrl(redirectTo, { error: "Assessment counts must be zero or greater." }));
  }

  await prisma.assessmentSetting.upsert({
    where: {
      quarter_subjectId_classId: {
        quarter,
        subjectId,
        classId,
      },
    },
    update: {
      sorCount,
      sochCount,
    },
    create: {
      quarter,
      subjectId,
      classId,
      sorCount,
      sochCount,
    },
  });

  revalidateMethodistPaths(redirectTo);
  redirect(buildStatusUrl(redirectTo, { success: "Assessment setting saved." }));
}

export async function deleteAssessmentSettingAction(formData: FormData) {
  await requireDatabaseUser([Role.METHODIST, Role.MODERATOR]);
  const redirectTo = getRedirectTo(formData, "/en/dashboard/methodist/settings");
  const settingId = String(formData.get("settingId") || "").trim();

  if (!settingId) {
    redirect(buildStatusUrl(redirectTo, { error: "Setting not found." }));
  }

  await prisma.assessmentSetting.delete({ where: { id: settingId } });
  revalidateMethodistPaths(redirectTo);
  redirect(buildStatusUrl(redirectTo, { success: "Assessment setting deleted." }));
}

export async function generateAssessmentsAction(formData: FormData) {
  await requireDatabaseUser([Role.METHODIST, Role.MODERATOR]);
  const redirectTo = getRedirectTo(formData, "/en/dashboard/methodist/settings");
  const quarter = parseNumber(formData.get("quarter"));
  const subjectId = String(formData.get("subjectId") || "").trim();
  const classId = String(formData.get("classId") || "").trim();
  const sorMaxScore = parseNumber(formData.get("sorMaxScore"));
  const sochMaxScore = parseNumber(formData.get("sochMaxScore"));

  if (!subjectId || !classId || ![1, 2, 3, 4].includes(quarter)) {
    redirect(buildStatusUrl(redirectTo, { error: "Quarter, subject, and class are required." }));
  }

  if (sorMaxScore <= 0 || sochMaxScore <= 0) {
    redirect(buildStatusUrl(redirectTo, { error: "Max score values must be greater than zero." }));
  }

  const setting = await prisma.assessmentSetting.findUnique({
    where: {
      quarter_subjectId_classId: {
        quarter,
        subjectId,
        classId,
      },
    },
  });

  if (!setting) {
    redirect(buildStatusUrl(redirectTo, { error: "Create the assessment setting first." }));
  }

  const existing = await prisma.assessment.findMany({
    where: { quarter, subjectId, classId },
  });

  const desired = [
    ...Array.from({ length: setting.sorCount }, (_, index) => ({
      type: AssessmentType.SOR,
      number: index + 1,
      quarter,
      subjectId,
      classId,
      maxScore: sorMaxScore,
    })),
    ...Array.from({ length: setting.sochCount }, (_, index) => ({
      type: AssessmentType.SOCH,
      number: index + 1,
      quarter,
      subjectId,
      classId,
      maxScore: sochMaxScore,
    })),
  ];

  const desiredKeys = new Set(desired.map((item) => `${item.type}:${item.number}`));

  await prisma.$transaction([
    ...desired.map((item) =>
      prisma.assessment.upsert({
        where: {
          type_number_quarter_subjectId_classId: {
            type: item.type,
            number: item.number,
            quarter,
            subjectId,
            classId,
          },
        },
        update: {
          maxScore: item.maxScore,
        },
        create: item,
      }),
    ),
    prisma.assessment.deleteMany({
      where: {
        id: {
          in: existing
            .filter((item) => !desiredKeys.has(`${item.type}:${item.number}`))
            .map((item) => item.id),
        },
      },
    }),
  ]);

  revalidateMethodistPaths(redirectTo);
  redirect(buildStatusUrl(redirectTo, { success: "Assessments generated from the current setting." }));
}
