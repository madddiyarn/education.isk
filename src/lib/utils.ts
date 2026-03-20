import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function roundTo(value: number, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function formatPercentage(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }

  return `${value.toFixed(2)}%`;
}

export function buildStatusUrl(
  pathname: string,
  params: {
    error?: string;
    success?: string;
  },
) {
  const url = new URL(pathname, "http://localhost");

  if (params.error) {
    url.searchParams.set("error", params.error);
  }

  if (params.success) {
    url.searchParams.set("success", params.success);
  }

  return `${url.pathname}${url.search}`;
}
