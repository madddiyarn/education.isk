import type { ReactNode } from "react";
import { notFound } from "next/navigation";

import { isSupportedLocale } from "@/lib/locale";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const resolvedParams = await params;

  if (!isSupportedLocale(resolvedParams.locale)) {
    notFound();
  }

  return children;
}
