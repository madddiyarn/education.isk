import { Role } from "@prisma/client";

import { DetailsDialog } from "@/components/ui/DetailsDialog";
import { FeedbackMessage } from "@/components/ui/FeedbackMessage";
import { Panel } from "@/components/ui/Panel";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { deleteUserAction, upsertUserAction } from "@/features/moderator/actions";
import { requireDatabaseUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { normalizeLocale } from "@/lib/locale";
import { getRoleLabel } from "@/lib/presentation";

const roleOptions = Object.values(Role);

export default async function ModeratorUsersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const feedback = await searchParams;
  await requireDatabaseUser([Role.MODERATOR]);
  const redirectTo = `/${locale}/dashboard/moderator/users`;

  const [users, classes, subjects] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        studentProfile: {
          include: {
            class: true,
          },
        },
        teacherProfile: {
          include: {
            subject: true,
          },
        },
      },
    }),
    prisma.class.findMany({ orderBy: { name: "asc" } }),
    prisma.subject.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <FeedbackMessage message={feedback.success} />
      <FeedbackMessage message={feedback.error} tone="error" />

      <DetailsDialog title="Create or update user">
        <form action={upsertUserAction} className="grid gap-4 md:grid-cols-2">
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <label className="grid gap-2 text-sm text-slate-200">
            <span>Full name</span>
            <input className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3" name="fullName" required />
          </label>
          <label className="grid gap-2 text-sm text-slate-200">
            <span>Login</span>
            <input className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3" name="login" required />
          </label>
          <label className="grid gap-2 text-sm text-slate-200">
            <span>Password</span>
            <input className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3" name="password" type="password" />
          </label>
          <label className="grid gap-2 text-sm text-slate-200">
            <span>Role</span>
            <select className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3" name="role" defaultValue={Role.STUDENT}>
              {roleOptions.map((role) => (
              <option key={role} value={role}>
                  {getRoleLabel(role, locale)}
              </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm text-slate-200 md:col-span-2">
            <span>Student class assignment (optional)</span>
            <select className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3" name="classId" defaultValue="">
              <option value="">No class yet</option>
              {classes.map((schoolClass) => (
                <option key={schoolClass.id} value={schoolClass.id}>
                  {schoolClass.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm text-slate-200 md:col-span-2">
            <span>Teacher specialization subject (for teacher role)</span>
            <select className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3" name="teacherSubjectId" defaultValue="">
              <option value="">No specialization</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {locale === "ru" ? `Учитель ${subject.name}` : `${subject.name} teacher`}
                </option>
              ))}
            </select>
          </label>
          <div className="md:col-span-2">
            <SubmitButton label="Save user" pendingLabel="Saving..." />
          </div>
        </form>
      </DetailsDialog>

      <div className="grid gap-4">
        {users.map((user) => (
          <Panel key={user.id} className="space-y-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">{user.fullName}</h2>
                <p className="text-sm text-slate-400">
                  {user.login} • {getRoleLabel(user.role, locale)}
                  {user.studentProfile?.class ? ` • ${user.studentProfile.class.name}` : ""}
                  {user.teacherProfile?.subject
                    ? ` • ${locale === "ru" ? `Учитель ${user.teacherProfile.subject.name}` : `${user.teacherProfile.subject.name} teacher`}`
                    : ""}
                </p>
              </div>
              <form action={deleteUserAction}>
                <input type="hidden" name="redirectTo" value={redirectTo} />
                <input type="hidden" name="userId" value={user.id} />
                <SubmitButton label="Delete" pendingLabel="Deleting..." variant="danger" />
              </form>
            </div>

            <form action={upsertUserAction} className="grid gap-4 md:grid-cols-2">
              <input type="hidden" name="redirectTo" value={redirectTo} />
              <input type="hidden" name="userId" value={user.id} />
              <label className="grid gap-2 text-sm text-slate-200">
                <span>Full name</span>
                <input
                  className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3"
                  defaultValue={user.fullName}
                  name="fullName"
                  required
                />
              </label>
              <label className="grid gap-2 text-sm text-slate-200">
                <span>Login</span>
                <input
                  className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3"
                  defaultValue={user.login}
                  name="login"
                  required
                />
              </label>
              <label className="grid gap-2 text-sm text-slate-200">
                <span>New password (optional)</span>
                <input className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3" name="password" type="password" />
              </label>
              <label className="grid gap-2 text-sm text-slate-200">
                <span>Role</span>
                <select
                  className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3"
                  name="role"
                  defaultValue={user.role}
                >
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>
                      {getRoleLabel(role, locale)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm text-slate-200 md:col-span-2">
                <span>Teacher specialization subject</span>
                <select
                  className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3"
                  name="teacherSubjectId"
                  defaultValue={user.teacherProfile?.subjectId || ""}
                >
                  <option value="">No specialization</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {locale === "ru" ? `Учитель ${subject.name}` : `${subject.name} teacher`}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm text-slate-200 md:col-span-2">
                <span>Student class assignment</span>
                <select
                  className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3"
                  name="classId"
                  defaultValue={user.studentProfile?.classId || ""}
                >
                  <option value="">No class</option>
                  {classes.map((schoolClass) => (
                    <option key={schoolClass.id} value={schoolClass.id}>
                      {schoolClass.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="md:col-span-2">
                <SubmitButton label="Update user" pendingLabel="Updating..." variant="secondary" />
              </div>
            </form>
          </Panel>
        ))}
      </div>
    </div>
  );
}
