"use server";

import { Prisma, Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireDatabaseUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { stripSearchParams } from "@/lib/presentation";
import { buildStatusUrl } from "@/lib/utils";

function getRedirectTo(formData: FormData, fallback: string) {
  return String(formData.get("redirectTo") || fallback);
}

function revalidateDashboardPaths(redirectTo: string) {
  const basePath = stripSearchParams(redirectTo);
  const localeMatch = basePath.match(/^\/(en|ru)\//);
  const locale = localeMatch?.[1] || "en";

  revalidatePath(basePath);
  revalidatePath(`/${locale}/dashboard`);
}

function normalizeRole(value: string) {
  return Object.values(Role).includes(value as Role) ? (value as Role) : null;
}

export async function upsertUserAction(formData: FormData) {
  const currentUser = await requireDatabaseUser([Role.MODERATOR]);
  const redirectTo = getRedirectTo(formData, "/en/dashboard/moderator/users");
  const userId = String(formData.get("userId") || "").trim();
  const fullName = String(formData.get("fullName") || "").trim();
  const login = String(formData.get("login") || "").trim();
  const password = String(formData.get("password") || "").trim();
  const role = normalizeRole(String(formData.get("role") || ""));
  const classId = String(formData.get("classId") || "").trim();
  const teacherSubjectId = String(formData.get("teacherSubjectId") || "").trim();

  if (!fullName || !login || !role) {
    redirect(buildStatusUrl(redirectTo, { error: "Full name, login, and role are required." }));
  }

  if (role === Role.TEACHER && !teacherSubjectId) {
    redirect(buildStatusUrl(redirectTo, { error: "Teacher specialization subject is required for teacher accounts." }));
  }

  try {
    if (userId) {
      const data: Prisma.UserUpdateInput = {
        fullName,
        login,
        role,
      };

      if (password) {
        data.passwordHash = await hashPassword(password);
      }

      await prisma.user.update({
        where: { id: userId },
        data,
      });

      if (role === Role.STUDENT && classId) {
        await prisma.studentProfile.upsert({
          where: { userId },
          update: { classId },
          create: { userId, classId },
        });
      }

      if (role === Role.TEACHER) {
        await prisma.teacherProfile.upsert({
          where: { userId },
          update: { subjectId: teacherSubjectId },
          create: { userId, subjectId: teacherSubjectId },
        });
      }

      if (role !== Role.STUDENT) {
        await prisma.studentProfile.deleteMany({ where: { userId } });
      }

      if (role !== Role.TEACHER) {
        await prisma.teacherProfile.deleteMany({ where: { userId } });
        await prisma.teacherAssignment.deleteMany({ where: { teacherId: userId } });
      }
    } else {
      if (!password) {
        redirect(buildStatusUrl(redirectTo, { error: "Password is required for a new account." }));
      }

      const createdUser = await prisma.user.create({
        data: {
          fullName,
          login,
          passwordHash: await hashPassword(password),
          role,
        },
      });

      if (role === Role.STUDENT && classId) {
        await prisma.studentProfile.create({
          data: {
            userId: createdUser.id,
            classId,
          },
        });
      }

      if (role === Role.TEACHER) {
        await prisma.teacherProfile.create({
          data: {
            userId: createdUser.id,
            subjectId: teacherSubjectId,
          },
        });
      }
    }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      redirect(buildStatusUrl(redirectTo, { error: "This login or assignment already exists." }));
    }

    throw error;
  }

  revalidateDashboardPaths(redirectTo);
  redirect(buildStatusUrl(redirectTo, { success: `Saved by ${currentUser.fullName}.` }));
}

export async function deleteUserAction(formData: FormData) {
  const currentUser = await requireDatabaseUser([Role.MODERATOR]);
  const redirectTo = getRedirectTo(formData, "/en/dashboard/moderator/users");
  const userId = String(formData.get("userId") || "");

  if (!userId) {
    redirect(buildStatusUrl(redirectTo, { error: "User not found." }));
  }

  if (userId === currentUser.id) {
    redirect(buildStatusUrl(redirectTo, { error: "You cannot delete your own moderator account." }));
  }

  await prisma.user.delete({ where: { id: userId } });
  revalidateDashboardPaths(redirectTo);
  redirect(buildStatusUrl(redirectTo, { success: "User deleted." }));
}

export async function upsertClassAction(formData: FormData) {
  await requireDatabaseUser([Role.MODERATOR]);
  const redirectTo = getRedirectTo(formData, "/en/dashboard/moderator/classes");
  const classId = String(formData.get("classId") || "").trim();
  const name = String(formData.get("name") || "").trim();

  if (!name) {
    redirect(buildStatusUrl(redirectTo, { error: "Class name is required." }));
  }

  if (classId) {
    await prisma.class.update({ where: { id: classId }, data: { name } });
  } else {
    await prisma.class.create({ data: { name } });
  }

  revalidateDashboardPaths(redirectTo);
  redirect(buildStatusUrl(redirectTo, { success: "Class saved." }));
}

export async function deleteClassAction(formData: FormData) {
  await requireDatabaseUser([Role.MODERATOR]);
  const redirectTo = getRedirectTo(formData, "/en/dashboard/moderator/classes");
  const classId = String(formData.get("classId") || "");

  if (!classId) {
    redirect(buildStatusUrl(redirectTo, { error: "Class not found." }));
  }

  await prisma.class.delete({ where: { id: classId } });
  revalidateDashboardPaths(redirectTo);
  redirect(buildStatusUrl(redirectTo, { success: "Class deleted." }));
}

export async function upsertSubjectAction(formData: FormData) {
  await requireDatabaseUser([Role.MODERATOR]);
  const redirectTo = getRedirectTo(formData, "/en/dashboard/moderator/subjects");
  const subjectId = String(formData.get("subjectId") || "").trim();
  const name = String(formData.get("name") || "").trim();

  if (!name) {
    redirect(buildStatusUrl(redirectTo, { error: "Subject name is required." }));
  }

  if (subjectId) {
    await prisma.subject.update({ where: { id: subjectId }, data: { name } });
  } else {
    await prisma.subject.create({ data: { name } });
  }

  revalidateDashboardPaths(redirectTo);
  redirect(buildStatusUrl(redirectTo, { success: "Subject saved." }));
}

export async function deleteSubjectAction(formData: FormData) {
  await requireDatabaseUser([Role.MODERATOR]);
  const redirectTo = getRedirectTo(formData, "/en/dashboard/moderator/subjects");
  const subjectId = String(formData.get("subjectId") || "");

  if (!subjectId) {
    redirect(buildStatusUrl(redirectTo, { error: "Subject not found." }));
  }

  await prisma.subject.delete({ where: { id: subjectId } });
  revalidateDashboardPaths(redirectTo);
  redirect(buildStatusUrl(redirectTo, { success: "Subject deleted." }));
}

export async function upsertTeacherAssignmentAction(formData: FormData) {
  await requireDatabaseUser([Role.MODERATOR]);
  const redirectTo = getRedirectTo(formData, "/en/dashboard/moderator/teacher-assignments");
  const assignmentId = String(formData.get("assignmentId") || "").trim();
  const teacherId = String(formData.get("teacherId") || "").trim();
  const subjectId = String(formData.get("subjectId") || "").trim();
  const classId = String(formData.get("classId") || "").trim();
  const classIds = formData
    .getAll("classIds")
    .map((value) => String(value).trim())
    .filter(Boolean);

  if (!teacherId || !subjectId || (!classId && classIds.length === 0)) {
    redirect(buildStatusUrl(redirectTo, { error: "Teacher, subject, and at least one class are required." }));
  }

  if (assignmentId) {
    await prisma.teacherAssignment.update({
      where: { id: assignmentId },
      data: { teacherId, subjectId, classId },
    });
  } else {
    await prisma.$transaction(
      (classIds.length ? classIds : [classId]).map((selectedClassId) =>
        prisma.teacherAssignment.upsert({
          where: {
            teacherId_subjectId_classId: {
              teacherId,
              subjectId,
              classId: selectedClassId,
            },
          },
          update: {},
          create: { teacherId, subjectId, classId: selectedClassId },
        }),
      ),
    );
  }

  revalidateDashboardPaths(redirectTo);
  redirect(buildStatusUrl(redirectTo, { success: "Teacher assignment saved." }));
}

export async function deleteTeacherAssignmentAction(formData: FormData) {
  await requireDatabaseUser([Role.MODERATOR]);
  const redirectTo = getRedirectTo(formData, "/en/dashboard/moderator/teacher-assignments");
  const assignmentId = String(formData.get("assignmentId") || "");

  if (!assignmentId) {
    redirect(buildStatusUrl(redirectTo, { error: "Assignment not found." }));
  }

  await prisma.teacherAssignment.delete({ where: { id: assignmentId } });
  revalidateDashboardPaths(redirectTo);
  redirect(buildStatusUrl(redirectTo, { success: "Teacher assignment deleted." }));
}

export async function assignStudentToClassAction(formData: FormData) {
  await requireDatabaseUser([Role.MODERATOR]);
  const redirectTo = getRedirectTo(formData, "/en/dashboard/moderator/student-assignments");
  const userId = String(formData.get("userId") || "").trim();
  const classId = String(formData.get("classId") || "").trim();

  if (!userId || !classId) {
    redirect(buildStatusUrl(redirectTo, { error: "Student and class are required." }));
  }

  const student = await prisma.user.findUnique({ where: { id: userId } });

  if (!student || student.role !== Role.STUDENT) {
    redirect(buildStatusUrl(redirectTo, { error: "Only student accounts can be assigned to classes." }));
  }

  await prisma.studentProfile.upsert({
    where: { userId },
    update: { classId },
    create: { userId, classId },
  });

  revalidateDashboardPaths(redirectTo);
  redirect(buildStatusUrl(redirectTo, { success: "Student assigned to class." }));
}
