import type { ReactNode } from "react";

import { Panel } from "@/components/ui/Panel";

export function StatCard({
  title,
  value,
  caption,
  icon,
}: {
  title: string;
  value: string | number;
  caption: string;
  icon?: ReactNode;
}) {
  return (
    <Panel className="relative overflow-hidden">
      <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-teal-500/10 blur-2xl" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">{title}</p>
          <p className="mt-3 text-3xl font-bold text-white">{value}</p>
          <p className="mt-2 text-sm text-slate-400">{caption}</p>
        </div>
        {icon ? <div className="rounded-2xl bg-teal-500/10 p-3 text-teal-200">{icon}</div> : null}
      </div>
    </Panel>
  );
}
