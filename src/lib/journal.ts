import { AssessmentType, type Grade } from "@prisma/client";

import { buildQuarterSummary } from "@/lib/grades";

type AssessmentLike = {
  id: string;
  type: AssessmentType;
  number: number;
  maxScore: number;
};

type StudentLike = {
  id: string;
  user: {
    fullName: string;
  };
};

export function buildJournalRows({
  assessments,
  grades,
  students,
}: {
  assessments: AssessmentLike[];
  grades: Grade[];
  students: StudentLike[];
}) {
  const gradesMap = new Map<string, Grade>();

  for (const grade of grades) {
    gradesMap.set(`${grade.studentId}:${grade.assessmentId}`, grade);
  }

  return students.map((student) => {
    const assessmentCells = assessments.map((assessment) => {
      const grade = gradesMap.get(`${student.id}:${assessment.id}`);

      return {
        assessment,
        score: grade?.score ?? null,
        percentage: grade?.percentage ?? null,
      };
    });

    const summary = buildQuarterSummary(
      assessmentCells.map((cell) => ({
        type: cell.assessment.type,
        percentage: cell.percentage,
      })),
    );

    return {
      studentId: student.id,
      studentName: student.user.fullName,
      cells: assessmentCells,
      finalPercentage: summary.finalPercentage,
      finalMark: summary.finalMark,
    };
  });
}
