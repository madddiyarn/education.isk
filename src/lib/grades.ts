import { AssessmentType } from "@prisma/client";

import type { FinalMark } from "@/types";
import { roundTo } from "@/lib/utils";

export type QuarterAssessmentInput = {
  type: AssessmentType;
  percentage: number | null;
};

export function calculatePercentage(score: number, maxScore: number) {
  if (!Number.isFinite(score) || !Number.isFinite(maxScore) || maxScore <= 0) {
    throw new Error("Invalid score or maxScore.");
  }

  return roundTo((score / maxScore) * 100, 2);
}

export function calculateFinalQuarterPercentage(input: {
  sorPercentages: Array<number | null>;
  sochPercentages: Array<number | null>;
}) {
  const sorAverage = averagePercentages(input.sorPercentages);
  const sochAverage = averagePercentages(input.sochPercentages);

  return roundTo(sorAverage * 0.5 + sochAverage * 0.5, 2);
}

export function convertFinalPercentageToMark(percentage: number): FinalMark {
  if (percentage >= 84.5 && percentage <= 100) {
    return "5";
  }

  if (percentage >= 64.5 && percentage <= 84.49) {
    return "4";
  }

  if (percentage >= 39.5 && percentage <= 64.49) {
    return "3";
  }

  if (percentage >= 10 && percentage <= 39.49) {
    return "2";
  }

  return "U";
}

export function buildQuarterSummary(assessments: QuarterAssessmentInput[]) {
  const sorPercentages = assessments
    .filter((assessment) => assessment.type === AssessmentType.SOR)
    .map((assessment) => assessment.percentage);
  const sochPercentages = assessments
    .filter((assessment) => assessment.type === AssessmentType.SOCH)
    .map((assessment) => assessment.percentage);
  const finalPercentage = calculateFinalQuarterPercentage({ sorPercentages, sochPercentages });

  return {
    sorAverage: averagePercentages(sorPercentages),
    sochAverage: averagePercentages(sochPercentages),
    finalPercentage,
    finalMark: convertFinalPercentageToMark(finalPercentage),
  };
}

function averagePercentages(values: Array<number | null>) {
  if (values.length === 0) {
    return 0;
  }

  const normalized = values.map((value) => value ?? 0);
  const sum = normalized.reduce((accumulator, value) => accumulator + value, 0);

  return roundTo(sum / normalized.length, 2);
}
