import type { ReactNode } from "react";

export function DataTable({ headers, rows }: { headers: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-cyan-300/15 bg-white/[0.04] shadow-[0_18px_60px_rgba(0,0,0,0.22)]">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="bg-cyan-300/10 text-xs uppercase tracking-wide text-cyan-100/65">
          <tr>{headers.map((header) => <th key={header} className="px-4 py-3 font-semibold">{header}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-cyan-300/10">
          {rows.map((row, index) => (
            <tr key={index} className="hover:bg-cyan-300/5">
              {row.map((cell, cellIndex) => <td key={cellIndex} className="px-4 py-3 text-slate-300">{cell}</td>)}
            </tr>
          ))}
          {!rows.length ? (
            <tr>
              <td colSpan={headers.length} className="px-4 py-10 text-center text-slate-500">No feedback records yet</td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
