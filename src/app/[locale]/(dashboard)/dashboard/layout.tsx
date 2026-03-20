import type { ReactNode } from "react";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { requireUser } from "@/lib/auth";
import { getDictionary } from "@/lib/dictionaries";
import { normalizeLocale } from "@/lib/locale";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);
  const dictionary = getDictionary(locale);
  const sessionUser = await requireUser();

  return (
    <DashboardShell
      locale={locale}
      role={sessionUser.role}
      title={dictionary.dashboard}
      subtitle={dictionary.resultReady}
    >
      {children}
    </DashboardShell>
  );
}
