import { Role } from "@prisma/client";

import { StatCard } from "@/components/dashboard/StatCard";
import { Panel } from "@/components/ui/Panel";
import { requireDatabaseUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function ModeratorOverviewPage() {
  await requireDatabaseUser([Role.MODERATOR]);

  const [usersCount, classesCount, subjectsCount, gradesCount, assignmentCount] = await Promise.all([
    prisma.user.count(),
    prisma.class.count(),
    prisma.subject.count(),
    prisma.grade.count(),
    prisma.teacherAssignment.count(),
  ]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Users" value={usersCount} caption="Accounts across all roles" />
        <StatCard title="Classes" value={classesCount} caption="School classes in the journal" />
        <StatCard title="Subjects" value={subjectsCount} caption="Available subjects" />
        <StatCard title="Grades" value={gradesCount} caption={`${assignmentCount} teacher assignments connected`} />
      </div>

      <Panel>
        <h2 className="text-xl font-semibold text-white">Moderator control center</h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-400">
          Use the sections in the sidebar to create users, manage classes and subjects, assign teachers and students,
          and inspect grades across the whole school. All changes here are applied directly to the protected journal
          data model.
        </p>
      </Panel>
    </div>
  );
}
