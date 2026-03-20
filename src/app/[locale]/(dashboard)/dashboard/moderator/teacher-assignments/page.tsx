import { Role } from "@prisma/client";

import { DetailsDialog } from "@/components/ui/DetailsDialog";
import { FeedbackMessage } from "@/components/ui/FeedbackMessage";
import { Panel } from "@/components/ui/Panel";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { deleteTeacherAssignmentAction, upsertTeacherAssignmentAction } from "@/features/moderator/actions";
import { requireDatabaseUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function ModeratorTeacherAssignmentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const { locale } = await params;
  const feedback = await searchParams;
  await requireDatabaseUser([Role.MODERATOR]);
  const redirectTo = `/${locale}/dashboard/moderator/teacher-assignments`;

  const [teachers, subjects, classes, assignments] = await Promise.all([
    prisma.user.findMany({
      where: { role: Role.TEACHER },
      orderBy: { fullName: "asc" },
      include: {
        teacherProfile: {
          include: {
            subject: true,
          },
        },
      },
    }),
    prisma.subject.findMany({ orderBy: { name: "asc" } }),
    prisma.class.findMany({ orderBy: { name: "asc" } }),
    prisma.teacherAssignment.findMany({
      orderBy: [{ teacher: { fullName: "asc" } }, { class: { name: "asc" } }],
      include: {
        teacher: true,
        subject: true,
        class: true,
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      <FeedbackMessage message={feedback.success} />
      <FeedbackMessage message={feedback.error} tone="error" />
      <DetailsDialog title="Create teacher assignment">
        <form action={upsertTeacherAssignmentAction} className="grid gap-4 md:grid-cols-3">
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <label className="grid gap-2 text-sm text-slate-200">
            <span>Teacher</span>
            <select className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3" name="teacherId" required>
              <option value="">Select teacher</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.fullName}
                  {teacher.teacherProfile?.subject ? ` • ${teacher.teacherProfile.subject.name}` : ""}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm text-slate-200">
            <span>Subject</span>
            <select className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3" name="subjectId" required>
              <option value="">Select subject</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm text-slate-200">
            <span>Class</span>
            <div className="max-h-64 space-y-2 overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/50 p-3">
              {classes.map((schoolClass) => (
                <label key={schoolClass.id} className="flex items-center gap-3 text-sm text-slate-200">
                  <input name="classIds" type="checkbox" value={schoolClass.id} />
                  <span>{schoolClass.name}</span>
                </label>
              ))}
            </div>
          </label>
          <div className="md:col-span-3">
            <SubmitButton label="Assign to classes" pendingLabel="Saving..." />
          </div>
        </form>
      </DetailsDialog>

      <div className="grid gap-4">
        {assignments.map((assignment) => (
          <Panel key={assignment.id} className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-white">{assignment.teacher.fullName}</h2>
              <p className="text-sm text-slate-400">
                {assignment.subject.name} • {assignment.class.name}
              </p>
            </div>
            <form action={upsertTeacherAssignmentAction} className="grid gap-4 md:grid-cols-3">
              <input type="hidden" name="redirectTo" value={redirectTo} />
              <input type="hidden" name="assignmentId" value={assignment.id} />
              <select
                className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3"
                defaultValue={assignment.teacherId}
                name="teacherId"
                required
              >
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.fullName}
                    {teacher.teacherProfile?.subject ? ` • ${teacher.teacherProfile.subject.name}` : ""}
                  </option>
                ))}
              </select>
              <select
                className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3"
                defaultValue={assignment.subjectId}
                name="subjectId"
                required
              >
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
              <select
                className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3"
                defaultValue={assignment.classId}
                name="classId"
                required
              >
                {classes.map((schoolClass) => (
                  <option key={schoolClass.id} value={schoolClass.id}>
                    {schoolClass.name}
                  </option>
                ))}
              </select>
              <div className="md:col-span-3 flex flex-wrap gap-3">
                <SubmitButton label="Update" pendingLabel="Updating..." variant="secondary" />
              </div>
            </form>
            <form action={deleteTeacherAssignmentAction}>
              <input type="hidden" name="redirectTo" value={redirectTo} />
              <input type="hidden" name="assignmentId" value={assignment.id} />
              <SubmitButton label="Delete" pendingLabel="Deleting..." variant="danger" />
            </form>
          </Panel>
        ))}
      </div>
    </div>
  );
}
