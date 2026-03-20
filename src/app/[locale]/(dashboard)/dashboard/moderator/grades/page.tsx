import { Role } from "@prisma/client";

import { Panel } from "@/components/ui/Panel";
import { requireDatabaseUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getAssessmentTypeLabel } from "@/lib/presentation";
import { formatPercentage } from "@/lib/utils";

export default async function ModeratorGradesPage() {
  await requireDatabaseUser([Role.MODERATOR]);

  const grades = await prisma.grade.findMany({
    orderBy: { updatedAt: "desc" },
    take: 150,
    include: {
      student: {
        include: {
          user: true,
          class: true,
        },
      },
      assessment: {
        include: {
          subject: true,
          class: true,
        },
      },
    },
  });

  return (
    <Panel className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/10 text-left text-sm">
          <thead className="bg-white/5">
            <tr>
              {["Student", "Class", "Subject", "Quarter", "Assessment", "Score", "Percentage"].map((label) => (
                <th key={label} className="px-4 py-3 font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {grades.map((grade) => (
              <tr key={grade.id}>
                <td className="px-4 py-3 text-slate-100">{grade.student.user.fullName}</td>
                <td className="px-4 py-3 text-slate-300">{grade.assessment.class.name}</td>
                <td className="px-4 py-3 text-slate-300">{grade.assessment.subject.name}</td>
                <td className="px-4 py-3 text-slate-300">{grade.assessment.quarter}</td>
                <td className="px-4 py-3 text-slate-300">
                  {getAssessmentTypeLabel(grade.assessment.type)} {grade.assessment.number}
                </td>
                <td className="px-4 py-3 text-slate-300">
                  {grade.score} / {grade.assessment.maxScore}
                </td>
                <td className="px-4 py-3 text-slate-300">{formatPercentage(grade.percentage)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
