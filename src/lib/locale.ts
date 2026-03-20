import { cookies } from "next/headers";

import { DEFAULT_LOCALE } from "@/lib/constants";
import type { Locale } from "@/types";
import { supportedLocales } from "@/types";

export function isSupportedLocale(locale: string): locale is Locale {
  return supportedLocales.includes(locale as Locale);
}

export function normalizeLocale(locale?: string): Locale {
  if (locale && isSupportedLocale(locale)) {
    return locale;
  }

  return DEFAULT_LOCALE;
}

export async function getPreferredLocale() {
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value;

  return normalizeLocale(locale);
}
