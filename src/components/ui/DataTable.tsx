import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type Column<T> = {
  key: string;
  header: string;
  className?: string;
  render: (row: T) => ReactNode;
};

export function DataTable<T>({
  columns,
  rows,
  emptyState,
  rowKey,
}: {
  columns: Column<T>[];
  rows: T[];
  emptyState?: ReactNode;
  rowKey: (row: T) => string;
}) {
  if (!rows.length) {
    return <>{emptyState}</>;
  }

  return (
    <div className="overflow-hidden rounded-[24px] border border-white/10">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/10 text-left text-sm">
          <thead className="bg-white/5">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn("px-4 py-3 font-semibold uppercase tracking-[0.18em] text-slate-400", column.className)}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 bg-slate-950/30">
            {rows.map((row) => (
              <tr key={rowKey(row)} className="align-top">
                {columns.map((column) => (
                  <td key={column.key} className={cn("px-4 py-3 text-slate-200", column.className)}>
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
