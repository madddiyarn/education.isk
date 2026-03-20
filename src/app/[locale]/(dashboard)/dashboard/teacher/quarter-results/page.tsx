import { Role } from "@prisma/client";

import { Panel } from "@/components/ui/Panel";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { requireDatabaseUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { buildJournalRows } from "@/lib/journal";
import { getAssessmentTypeLabel } from "@/lib/presentation";
import { formatPercentage } from "@/lib/utils";

function sortAssessments<T extends { type: "SOR" | "SOCH"; number: number }>(items: T[]) {
  return [...items].sort((left, right) => {
    const leftRank = left.type === "SOR" ? 0 : 1;
    const rightRank = right.type === "SOR" ? 0 : 1;

    if (leftRank !== rightRank) {
      return leftRank - rightRank;
    }

    return left.number - right.number;
  });
}

export default async function TeacherQuarterResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ assignmentId?: string; quarter?: string }>;
}) {
  const query = await searchParams;
  const teacher = await requireDatabaseUser([Role.TEACHER]);
  const assignments = await prisma.teacherAssignment.findMany({
    where: { teacherId: teacher.id },
    orderBy: [{ class: { name: "asc" } }, { subject: { name: "asc" } }],
    include: {
      class: true,
      subject: true,
    },
  });

  const selectedAssignment =
    assignments.find((assignment) => assignment.id === query.assignmentId) || assignments[0];
  const quarter = [1, 2, 3, 4].includes(Number(query.quarter)) ? Number(query.quarter) : 1;

  if (!selectedAssignment) {
    return (
      <Panel>
        <h2 className="text-xl font-semibold text-white">No assignments yet</h2>
        <p className="mt-2 text-sm text-slate-400">Quarter results will appear after the first teacher assignment.</p>
      </Panel>
    );
  }

  const [students, assessments, grades] = await Promise.all([
    prisma.studentProfile.findMany({
      where: { classId: selectedAssignment.classId },
      orderBy: { user: { fullName: "asc" } },
      include: { user: true },
    }),
    prisma.assessment.findMany({
      where: {
        classId: selectedAssignment.classId,
        subjectId: selectedAssignment.subjectId,
        quarter,
      },
    }),
    prisma.grade.findMany({
      where: {
        assessment: {
          classId: selectedAssignment.classId,
          subjectId: selectedAssignment.subjectId,
          quarter,
        },
      },
    }),
  ]);

  const orderedAssessments = sortAssessments(assessments);
  const rows = buildJournalRows({ assessments: orderedAssessments, grades, students });

  return (
    <div className="space-y-6">
      <Panel>
        <form className="grid gap-4 md:grid-cols-[1fr_220px_auto]" method="get">
          <label className="grid gap-2 text-sm text-slate-200">
            <span>Assignment</span>
            <select
              className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3"
              defaultValue={selectedAssignment.id}
              name="assignmentId"
            >
              {assignments.map((assignment) => (
                <option key={assignment.id} value={assignment.id}>
                  {assignment.class.name} • {assignment.subject.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm text-slate-200">
            <span>Quarter</span>
            <select className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3" defaultValue={quarter} name="quarter">
              {[1, 2, 3, 4].map((quarterOption) => (
                <option key={quarterOption} value={quarterOption}>
                  Quarter {quarterOption}
                </option>
              ))}
            </select>
          </label>
          <div className="self-end">
            <SubmitButton label="Show results" pendingLabel="Opening..." variant="secondary" />
          </div>
        </form>
      </Panel>

      <Panel className="overflow-hidden">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-white">
            {selectedAssignment.class.name} • {selectedAssignment.subject.name} • Quarter {quarter}
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Final percentage = average SAU percentages × 0.5 + average SAT percentages × 0.5.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10 text-left text-sm">
            <thead className="bg-white/5">
              <tr>
                <th className="px-4 py-3 font-semibold uppercase tracking-[0.18em] text-slate-400">Student</th>
                {orderedAssessments.map((assessment) => (
                  <th key={assessment.id} className="px-4 py-3 font-semibold uppercase tracking-[0.18em] text-slate-400">
                    {getAssessmentTypeLabel(assessment.type)} {assessment.number}
                  </th>
                ))}
                <th className="px-4 py-3 font-semibold uppercase tracking-[0.18em] text-slate-400">Final %</th>
                <th className="px-4 py-3 font-semibold uppercase tracking-[0.18em] text-slate-400">Mark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.map((row) => (
                <tr key={row.studentId}>
                  <td className="px-4 py-3 text-slate-100">{row.studentName}</td>
                  {row.cells.map((cell) => (
                    <td key={cell.assessment.id} className="px-4 py-3 text-slate-300">
                      {formatPercentage(cell.percentage)}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-slate-200">{formatPercentage(row.finalPercentage)}</td>
                  <td className="px-4 py-3 text-lg font-semibold text-white">{row.finalMark}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
