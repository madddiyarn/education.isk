import { Role } from "@prisma/client";

import { DetailsDialog } from "@/components/ui/DetailsDialog";
import { FeedbackMessage } from "@/components/ui/FeedbackMessage";
import { Panel } from "@/components/ui/Panel";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { deleteClassAction, upsertClassAction } from "@/features/moderator/actions";
import { requireDatabaseUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function ModeratorClassesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const { locale } = await params;
  const feedback = await searchParams;
  await requireDatabaseUser([Role.MODERATOR]);
  const redirectTo = `/${locale}/dashboard/moderator/classes`;
  const classes = await prisma.class.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          studentProfiles: true,
          teacherAssignments: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <FeedbackMessage message={feedback.success} />
      <FeedbackMessage message={feedback.error} tone="error" />
      <DetailsDialog title="Create class">
        <form action={upsertClassAction} className="grid gap-4 md:grid-cols-[1fr_auto]">
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <label className="grid gap-2 text-sm text-slate-200">
            <span>Class name</span>
            <input className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3" name="name" required />
          </label>
          <div className="self-end">
            <SubmitButton label="Create" pendingLabel="Saving..." />
          </div>
        </form>
      </DetailsDialog>
      <div className="grid gap-4 md:grid-cols-2">
        {classes.map((schoolClass) => (
          <Panel key={schoolClass.id} className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-white">{schoolClass.name}</h2>
              <p className="text-sm text-slate-400">
                {schoolClass._count.studentProfiles} students • {schoolClass._count.teacherAssignments} teacher assignments
              </p>
            </div>
            <form action={upsertClassAction} className="grid gap-3">
              <input type="hidden" name="redirectTo" value={redirectTo} />
              <input type="hidden" name="classId" value={schoolClass.id} />
              <input
                className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3"
                defaultValue={schoolClass.name}
                name="name"
                required
              />
              <div className="flex gap-3">
                <SubmitButton label="Update" pendingLabel="Updating..." variant="secondary" />
              </div>
            </form>
            <form action={deleteClassAction}>
              <input type="hidden" name="redirectTo" value={redirectTo} />
              <input type="hidden" name="classId" value={schoolClass.id} />
              <SubmitButton label="Delete" pendingLabel="Deleting..." variant="danger" />
            </form>
          </Panel>
        ))}
      </div>
    </div>
  );
}
