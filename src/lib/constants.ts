import type { Locale } from "@/types";

export const APP_NAME = "School Journal";
export const SESSION_COOKIE_NAME = "journal_session";
export const DEFAULT_LOCALE: Locale = (process.env.DEFAULT_LOCALE as Locale) || "en";
export const AUTH_SESSION_DAYS = 7;
export const QUARTERS = [1, 2, 3, 4] as const;
export const DEFAULT_MODERATOR_LOGIN = "moderator";
export const DEFAULT_MODERATOR_PASSWORD = "Moderator123!";
export const DEFAULT_MODERATOR_NAME = "Default Moderator";

export const ALL_CLASS_NAMES = [
  '7"A"',
  '7"B"',
  '7"C"',
  '7"D"',
  '7"E"',
  '7"F"',
  '7"G"',
  '7"H"',
  '8"A"',
  '8"B"',
  '8"C"',
  '8"D"',
  '8"E"',
  '8"F"',
  '8"G"',
  '8"H"',
  '9"A"',
  '9"B"',
  '9"C"',
  '9"D"',
  '9"E"',
  '9"F"',
  '9"G"',
  '9"H"',
  '10"A"',
  '10"B"',
  '10"C"',
  '10"D"',
  '10"E"',
  '10"F"',
  '10"G"',
  '10"H"',
  "11PhM10-1",
  "11PhM10-2",
  "11PhM7-1",
  "11PhCSM-1",
  "11CSM-1",
  "11CSM-2",
  "11PhCh-1",
  "11ChB-1",
  "11ChB-2",
  "11ChB-3",
  "12PhM10-1",
  "12PhM10-2",
  "12PhM7-1",
  "12PhCSM-1",
  "12CSM-1",
  "12CSM-2",
  "12PhCh-1",
  "12ChB-1",
  "12ChB-2",
  "12ChB-3",
] as const;

export const DEFAULT_SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "History",
  "English",
  "Kazakh Language",
  "Informatics",
] as const;

export const METHODIST_CLASS_GROUPS = [
  { value: "SINGLE", label: "Single class", prefixes: [] },
  { value: "7", label: "7", prefixes: ['7"'] },
  { value: "8", label: "8", prefixes: ['8"'] },
  { value: "9", label: "9", prefixes: ['9"'] },
  { value: "10", label: "10", prefixes: ['10"'] },
  { value: "11PhM10", label: "11PhM10", prefixes: ["11PhM10-"] },
  { value: "11PhM7", label: "11PhM7", prefixes: ["11PhM7-"] },
  { value: "11PhCSM", label: "11PhCSM", prefixes: ["11PhCSM-"] },
  { value: "11CSM", label: "11CSM", prefixes: ["11CSM-"] },
  { value: "11PhCh", label: "11PhCh", prefixes: ["11PhCh-"] },
  { value: "11ChB", label: "11ChB", prefixes: ["11ChB-"] },
  { value: "12PhM10", label: "12PhM10", prefixes: ["12PhM10-"] },
  { value: "12PhM7", label: "12PhM7", prefixes: ["12PhM7-"] },
  { value: "12PhCSM", label: "12PhCSM", prefixes: ["12PhCSM-"] },
  { value: "12CSM", label: "12CSM", prefixes: ["12CSM-"] },
  { value: "12PhCh", label: "12PhCh", prefixes: ["12PhCh-"] },
  { value: "12ChB", label: "12ChB", prefixes: ["12ChB-"] },
] as const;
