"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Role } from "@prisma/client";

import { getDictionary } from "@/lib/dictionaries";
import { cn } from "@/lib/utils";
import type { Locale } from "@/types";

type NavItem = {
  href: string;
  label: string;
};

function buildNavItems(locale: Locale, role: Role): NavItem[] {
  const dictionary = getDictionary(locale);

  if (role === Role.MODERATOR) {
    return [
      { href: `/${locale}/dashboard/moderator`, label: dictionary.overview },
      { href: `/${locale}/dashboard/moderator/users`, label: dictionary.users },
      { href: `/${locale}/dashboard/moderator/classes`, label: dictionary.classes },
      { href: `/${locale}/dashboard/moderator/subjects`, label: dictionary.subjects },
      { href: `/${locale}/dashboard/moderator/teacher-assignments`, label: dictionary.teacherAssignments },
      { href: `/${locale}/dashboard/moderator/student-assignments`, label: dictionary.studentAssignments },
      { href: `/${locale}/dashboard/moderator/grades`, label: dictionary.grades },
    ];
  }

  if (role === Role.TEACHER) {
    return [
      { href: `/${locale}/dashboard/teacher`, label: dictionary.overview },
      { href: `/${locale}/dashboard/teacher/journals`, label: dictionary.journals },
      { href: `/${locale}/dashboard/teacher/quarter-results`, label: dictionary.quarterResults },
    ];
  }

  if (role === Role.METHODIST) {
    return [
      { href: `/${locale}/dashboard/methodist`, label: dictionary.overview },
      { href: `/${locale}/dashboard/methodist/settings`, label: dictionary.assessmentSettings },
    ];
  }

  return [
    { href: `/${locale}/dashboard/student`, label: dictionary.overview },
    { href: `/${locale}/dashboard/student`, label: dictionary.myGrades },
  ];
}

export function Sidebar({
  locale,
  role,
}: {
  locale: Locale;
  role: Role;
}) {
  const currentPath = usePathname();
  const dictionary = getDictionary(locale);
  const items = buildNavItems(locale, role);
  const roleLabel =
    role === Role.MODERATOR
      ? dictionary.moderator
      : role === Role.METHODIST
        ? dictionary.methodist
        : role === Role.TEACHER
          ? dictionary.teacherRole
          : dictionary.studentRole;

  return (
    <aside className="flex h-full flex-col rounded-[32px] border border-white/10 bg-slate-950/60 p-5 backdrop-blur">
      <div>
        <div className="rounded-[24px] border border-teal-400/20 bg-teal-500/10 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-teal-200">{dictionary.appName}</p>
          <h2 className="mt-3 text-2xl font-bold text-white">{roleLabel}</h2>
        </div>
        <nav className="mt-6 space-y-2">
          {items.map((item) => {
            const active = currentPath === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block rounded-2xl px-4 py-3 text-sm font-medium transition",
                  active
                    ? "bg-white text-slate-950"
                    : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <p className="mt-6 text-xs leading-6 text-slate-500">
        {dictionary.noRegistration}
      </p>
    </aside>
  );
}
