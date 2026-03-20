import { Role } from "@prisma/client";

import type { Locale } from "@/types";

export const roleHomePaths: Record<Role, (locale: Locale) => string> = {
  MODERATOR: (locale) => `/${locale}/dashboard/moderator`,
  TEACHER: (locale) => `/${locale}/dashboard/teacher`,
  METHODIST: (locale) => `/${locale}/dashboard/methodist`,
  STUDENT: (locale) => `/${locale}/dashboard/student`,
};

export function hasRequiredRole(role: Role, allowedRoles: Role[]) {
  return allowedRoles.includes(role);
}

export function canAccessPath(role: Role, pathname: string) {
  if (pathname.includes("/dashboard/moderator")) {
    return role === Role.MODERATOR;
  }

  if (pathname.includes("/dashboard/teacher")) {
    return role === Role.TEACHER;
  }

  if (pathname.includes("/dashboard/methodist")) {
    return role === Role.METHODIST;
  }

  if (pathname.includes("/dashboard/student")) {
    return role === Role.STUDENT;
  }

  return true;
}
