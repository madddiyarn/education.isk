import { Role } from "@prisma/client";

import { FeedbackMessage } from "@/components/ui/FeedbackMessage";
import { Panel } from "@/components/ui/Panel";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { assignStudentToClassAction } from "@/features/moderator/actions";
import { requireDatabaseUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function ModeratorStudentAssignmentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const { locale } = await params;
  const feedback = await searchParams;
  await requireDatabaseUser([Role.MODERATOR]);
  const redirectTo = `/${locale}/dashboard/moderator/student-assignments`;

  const [students, classes] = await Promise.all([
    prisma.user.findMany({
      where: { role: Role.STUDENT },
      orderBy: { fullName: "asc" },
      include: {
        studentProfile: {
          include: { class: true },
        },
      },
    }),
    prisma.class.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <FeedbackMessage message={feedback.success} />
      <FeedbackMessage message={feedback.error} tone="error" />
      <div className="grid gap-4">
        {students.map((student) => (
          <Panel key={student.id}>
            <form action={assignStudentToClassAction} className="grid gap-4 md:grid-cols-[1.4fr_1fr_auto] md:items-end">
              <input type="hidden" name="redirectTo" value={redirectTo} />
              <input type="hidden" name="userId" value={student.id} />
              <div>
                <h2 className="text-lg font-semibold text-white">{student.fullName}</h2>
                <p className="text-sm text-slate-400">
                  {student.login}
                  {student.studentProfile?.class ? ` • ${student.studentProfile.class.name}` : " • No class assigned"}
                </p>
              </div>
              <label className="grid gap-2 text-sm text-slate-200">
                <span>Assign class</span>
                <select
                  className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3"
                  defaultValue={student.studentProfile?.classId || ""}
                  name="classId"
                  required
                >
                  <option value="">Select class</option>
                  {classes.map((schoolClass) => (
                    <option key={schoolClass.id} value={schoolClass.id}>
                      {schoolClass.name}
                    </option>
                  ))}
                </select>
              </label>
              <SubmitButton label="Save assignment" pendingLabel="Saving..." />
            </form>
          </Panel>
        ))}
      </div>
    </div>
  );
}
