import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function DetailsDialog({
  children,
  className,
  title,
}: {
  children: ReactNode;
  className?: string;
  title: string;
}) {
  return (
    <details className={cn("group rounded-[24px] border border-white/10 bg-white/5", className)}>
      <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-white marker:hidden">
        {title}
      </summary>
      <div className="border-t border-white/10 p-4">{children}</div>
    </details>
  );
}
