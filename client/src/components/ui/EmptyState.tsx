import { Inbox } from "lucide-react";

export function EmptyState({
  title = "Nothing here yet",
  text,
  description,
}: {
  title?: string;
  text?: string;
  description?: string;
}) {
  const message = text ?? description ?? "New activity will appear here automatically.";

  return (
    <div className="grid min-h-48 place-items-center rounded-2xl border border-dashed border-gray-200 bg-slate-50 p-8 text-center">
      <div>
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-white text-brand-green shadow-sm"><Inbox className="size-5" /></div>
        <p className="mt-4 font-display text-lg font-bold text-brand-navy">{title}</p>
        <p className="mt-1 text-sm text-slate-500">{message}</p>
      </div>
    </div>
  );
}
