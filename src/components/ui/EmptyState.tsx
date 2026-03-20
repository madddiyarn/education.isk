import type { ReactNode } from "react";

import { Panel } from "@/components/ui/Panel";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Panel className="border-dashed border-white/15 bg-slate-900/50">
      <div className="flex flex-col gap-3 text-center sm:text-left">
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="mt-1 text-sm text-slate-400">{description}</p>
        </div>
        {action}
      </div>
    </Panel>
  );
}
