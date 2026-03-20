import { AssessmentType, Role } from "@prisma/client";

import { EmptyState } from "@/components/ui/EmptyState";
import { Panel } from "@/components/ui/Panel";
import { requireDatabaseUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { buildQuarterSummary } from "@/lib/grades";
import { getAssessmentTypeLabel } from "@/lib/presentation";
import { formatPercentage } from "@/lib/utils";

type SubjectQuarterGroup = {
  key: string;
  subjectName: string;
  quarter: number;
  items: Array<{
    type: AssessmentType;
    number: number;
    score: number;
    maxScore: number;
    percentage: number;
  }>;
  finalPercentage: number;
  finalMark: string;
};

export default async function StudentDashboardPage() {
  const user = await requireDatabaseUser([Role.STUDENT]);

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: user.id },
  });

  if (!profile) {
    return (
      <Panel>
        <h2 className="text-xl font-semibold text-white">No class assignment yet</h2>
        <p className="mt-2 text-sm text-slate-400">
          A moderator needs to assign this student account to a class before grades can appear.
        </p>
      </Panel>
    );
  }

  const grades = await prisma.grade.findMany({
    where: { studentId: profile.id },
    orderBy: [{ assessment: { subject: { name: "asc" } } }, { assessment: { quarter: "asc" } }],
    include: {
      assessment: {
        include: {
          subject: true,
        },
      },
    },
  });

  const grouped = grades.reduce<Map<string, SubjectQuarterGroup>>((map, grade) => {
    const key = `${grade.assessment.subjectId}:${grade.assessment.quarter}`;
    const existing = map.get(key);
    const item = {
      type: grade.assessment.type,
      number: grade.assessment.number,
      score: grade.score,
      maxScore: grade.assessment.maxScore,
      percentage: grade.percentage,
    };

    if (existing) {
      existing.items.push(item);
      const summary = buildQuarterSummary(existing.items.map((entry) => ({ type: entry.type, percentage: entry.percentage })));
      existing.finalPercentage = summary.finalPercentage;
      existing.finalMark = summary.finalMark;
      return map;
    }

    const group: SubjectQuarterGroup = {
      key,
      subjectName: grade.assessment.subject.name,
      quarter: grade.assessment.quarter,
      items: [item],
      finalPercentage: 0,
      finalMark: "U",
    };
    const summary = buildQuarterSummary(group.items.map((entry) => ({ type: entry.type, percentage: entry.percentage })));
    group.finalPercentage = summary.finalPercentage;
    group.finalMark = summary.finalMark;
    map.set(key, group);
    return map;
  }, new Map());

  const groups = Array.from(grouped.values());

  if (groups.length === 0) {
    return (
      <EmptyState
        title="No grades yet"
        description="Your teachers have not entered grades for the assigned class and quarter structure yet."
      />
    );
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <Panel key={group.key}>
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">
                {group.subjectName} • Quarter {group.quarter}
              </h2>
              <p className="text-sm text-slate-400">Only your own grades are visible in this dashboard.</p>
            </div>
            <div className="text-sm text-slate-300">
              Final percentage: <span className="font-semibold text-white">{formatPercentage(group.finalPercentage)}</span>
              {" • "}
              Final mark: <span className="font-semibold text-white">{group.finalMark}</span>
            </div>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10 text-left text-sm">
              <thead className="bg-white/5">
                <tr>
                  {["Assessment", "Score", "Percentage"].map((label) => (
                    <th key={label} className="px-4 py-3 font-semibold uppercase tracking-[0.18em] text-slate-400">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {group.items.map((item) => (
                  <tr key={`${item.type}-${item.number}`}>
                    <td className="px-4 py-3 text-slate-100">
                      {getAssessmentTypeLabel(item.type)} {item.number}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {item.score} / {item.maxScore}
                    </td>
                    <td className="px-4 py-3 text-slate-300">{formatPercentage(item.percentage)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      ))}
    </div>
  );
}
