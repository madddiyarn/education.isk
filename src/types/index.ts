export const supportedLocales = ["en", "ru"] as const;

export type Locale = (typeof supportedLocales)[number];

export type Dictionary = Record<string, string>;

export type FinalMark = "5" | "4" | "3" | "2" | "U";

export type JournalGradeCell = {
  assessmentId: string;
  score: number | null;
  maxScore: number;
  percentage: number | null;
};
