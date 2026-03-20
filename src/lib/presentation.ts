import { AssessmentType, Role } from "@prisma/client";

import type { Locale } from "@/types";

export function getAssessmentTypeLabel(type: AssessmentType | "SOR" | "SOCH") {
  return type === "SOR" ? "SAU" : "SAT";
}

export function getRoleLabel(role: Role, locale: Locale) {
  if (locale === "ru") {
    if (role === Role.MODERATOR) return "Модератор";
    if (role === Role.TEACHER) return "Учитель";
    if (role === Role.METHODIST) return "Методист";
    return "Ученик";
  }

  if (role === Role.MODERATOR) return "Moderator";
  if (role === Role.TEACHER) return "Teacher";
  if (role === Role.METHODIST) return "Methodist";
  return "Student";
}

export function stripSearchParams(pathname: string) {
  return pathname.split("?")[0] || pathname;
}
