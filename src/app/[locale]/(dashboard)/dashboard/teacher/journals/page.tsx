import { Role } from "@prisma/client";

import { FeedbackMessage } from "@/components/ui/FeedbackMessage";
import { Panel } from "@/components/ui/Panel";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { saveJournalGradesAction } from "@/features/teacher/actions";
import { requireDatabaseUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { buildJournalRows } from "@/lib/journal";
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

export default async function TeacherJournalsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ assignmentId?: string; quarter?: string; success?: string; error?: string }>;
}) {
  const { locale } = await params;
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
  const redirectTo = `/${locale}/dashboard/teacher/journals?assignmentId=${selectedAssignment?.id || ""}&quarter=${quarter}`;

  if (!selectedAssignment) {
    return (
      <Panel>
        <h2 className="text-xl font-semibold text-white">No assignments yet</h2>
        <p className="mt-2 text-sm text-slate-400">
          A moderator needs to assign at least one class and subject before the journal becomes available.
        </p>
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
  const rows = buildJournalRows({
    assessments: orderedAssessments,
    grades,
    students,
  });

  return (
    <div className="space-y-6">
      <FeedbackMessage message={query.success} />
      <FeedbackMessage message={query.error} tone="error" />

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
            <SubmitButton label="Open journal" pendingLabel="Opening..." variant="secondary" />
          </div>
        </form>
      </Panel>

      {orderedAssessments.length === 0 ? (
        <Panel>
          <h2 className="text-xl font-semibold text-white">No assessments generated</h2>
          <p className="mt-2 text-sm text-slate-400">
            A methodist must configure SOR and SOCH settings and generate assessment rows for this class, subject, and
            quarter.
          </p>
        </Panel>
      ) : (
        <Panel className="overflow-hidden">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-white">
              {selectedAssignment.class.name} • {selectedAssignment.subject.name} • Quarter {quarter}
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Enter scores directly in the table. Percentages are calculated from `score / maxScore * 100`.
            </p>
          </div>
          <form action={saveJournalGradesAction}>
            <input type="hidden" name="redirectTo" value={redirectTo} />
            <input type="hidden" name="classId" value={selectedAssignment.classId} />
            <input type="hidden" name="subjectId" value={selectedAssignment.subjectId} />
            <input type="hidden" name="quarter" value={quarter} />
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10 text-left text-sm">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-4 py-3 font-semibold uppercase tracking-[0.18em] text-slate-400">Student</th>
                    {orderedAssessments.map((assessment) => (
                      <th key={assessment.id} className="px-4 py-3 font-semibold uppercase tracking-[0.18em] text-slate-400">
                        {assessment.type} {assessment.number}
                        <div className="text-[11px] font-normal text-slate-500">Max {assessment.maxScore}</div>
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
                        <td key={cell.assessment.id} className="px-4 py-3 align-top">
                          <input
                            className="w-24 rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-slate-100"
                            defaultValue={cell.score ?? ""}
                            max={cell.assessment.maxScore}
                            min="0"
                            name={`grade:${row.studentId}:${cell.assessment.id}`}
                            step="0.01"
                            type="number"
                          />
                          <p className="mt-2 text-xs text-slate-500">{formatPercentage(cell.percentage)}</p>
                        </td>
                      ))}
                      <td className="px-4 py-3 text-slate-200">{formatPercentage(row.finalPercentage)}</td>
                      <td className="px-4 py-3 text-lg font-semibold text-white">{row.finalMark}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4">
              <SubmitButton label="Save grades" pendingLabel="Saving grades..." />
            </div>
          </form>
        </Panel>
      )}
    </div>
  );
}
