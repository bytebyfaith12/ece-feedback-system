import type { ReactNode } from "react";

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <h1 className="display-title text-3xl text-white">{title}</h1>
        {subtitle ? <p className="mt-2 max-w-3xl text-slate-400">{subtitle}</p> : null}
      </div>
      {actions}
    </div>
  );
}
