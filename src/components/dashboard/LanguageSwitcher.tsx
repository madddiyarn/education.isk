"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/Button";
import type { Locale } from "@/types";

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const englishPath = pathname.replace(`/${locale}`, "/en");
  const russianPath = pathname.replace(`/${locale}`, "/ru");

  return (
    <div className="flex items-center gap-2">
      <Link href={englishPath}>
        <Button variant={locale === "en" ? "primary" : "secondary"} type="button">
          EN
        </Button>
      </Link>
      <Link href={russianPath}>
        <Button variant={locale === "ru" ? "primary" : "secondary"} type="button">
          RU
        </Button>
      </Link>
    </div>
  );
}
