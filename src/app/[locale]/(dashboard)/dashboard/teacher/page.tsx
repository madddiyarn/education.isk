import { Role } from "@prisma/client";

import { StatCard } from "@/components/dashboard/StatCard";
import { Panel } from "@/components/ui/Panel";
import { requireDatabaseUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function TeacherOverviewPage() {
  const teacher = await requireDatabaseUser([Role.TEACHER]);
  const [assignments, teacherProfile] = await Promise.all([
    prisma.teacherAssignment.findMany({
      where: { teacherId: teacher.id },
      include: {
        subject: true,
        class: true,
      },
    }),
    prisma.teacherProfile.findUnique({
      where: { userId: teacher.id },
      include: {
        subject: true,
      },
    }),
  ]);

  const uniqueClasses = new Set(assignments.map((assignment) => assignment.classId)).size;
  const uniqueSubjects = new Set(assignments.map((assignment) => assignment.subjectId)).size;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Assignments" value={assignments.length} caption="Class and subject combinations" />
        <StatCard title="Classes" value={uniqueClasses} caption="Visible only to this teacher" />
        <StatCard title="Subjects" value={uniqueSubjects} caption="Editable journal scope" />
      </div>
      <Panel>
        <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
          {teacherProfile?.subject ? `${teacherProfile.subject.name} teacher` : "Teacher"}
        </p>
        <h2 className="text-xl font-semibold text-white">My classes</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {assignments.map((assignment) => (
            <div key={assignment.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-lg font-semibold text-white">{assignment.class.name}</p>
              <p className="mt-1 text-sm text-slate-400">{assignment.subject.name}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
