import type { ReactNode } from "react";

import { LanguageSwitcher } from "@/components/dashboard/LanguageSwitcher";
import { LogoutButton } from "@/components/dashboard/LogoutButton";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { getDictionary } from "@/lib/dictionaries";
import type { Locale } from "@/types";
import { Role } from "@prisma/client";

export async function DashboardShell({
  children,
  locale,
  role,
  title,
  subtitle,
}: {
  children: ReactNode;
  locale: Locale;
  role: Role;
  title: string;
  subtitle: string;
}) {
  const dictionary = getDictionary(locale);

  return (
    <div className="min-h-screen px-4 py-4 md:px-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-7xl gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <Sidebar locale={locale} role={role} />
        <div className="rounded-[32px] border border-white/10 bg-slate-900/50 p-5 shadow-2xl shadow-slate-950/40 backdrop-blur">
          <header className="flex flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-teal-200">{role}</p>
              <h1 className="mt-2 text-3xl font-bold text-white">{title}</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-400">{subtitle}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <LanguageSwitcher locale={locale} />
              <LogoutButton
                locale={locale}
                label={dictionary.signOut}
                pendingLabel={locale === "ru" ? "Выход..." : "Signing out..."}
              />
            </div>
          </header>
          <main className="mt-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
