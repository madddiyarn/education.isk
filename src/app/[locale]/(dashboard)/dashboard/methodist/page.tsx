import { Role } from "@prisma/client";

import { StatCard } from "@/components/dashboard/StatCard";
import { Panel } from "@/components/ui/Panel";
import { requireDatabaseUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function MethodistOverviewPage() {
  await requireDatabaseUser([Role.METHODIST]);

  const [settingsCount, assessmentsCount, classesCount, subjectsCount] = await Promise.all([
    prisma.assessmentSetting.count(),
    prisma.assessment.count(),
    prisma.class.count(),
    prisma.subject.count(),
  ]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Settings" value={settingsCount} caption="Quarter configurations" />
        <StatCard title="Assessments" value={assessmentsCount} caption="Generated SOR and SOCH records" />
        <StatCard title="Classes" value={classesCount} caption="Available class scope" />
        <StatCard title="Subjects" value={subjectsCount} caption="Subjects in the journal" />
      </div>
      <Panel>
        <h2 className="text-xl font-semibold text-white">Assessment structure moderation</h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-400">
          Configure how many SOR and SOCH assessments exist for each quarter, class, and subject, then generate the
          exact assessment rows teachers will use inside the journal.
        </p>
      </Panel>
    </div>
  );
}
