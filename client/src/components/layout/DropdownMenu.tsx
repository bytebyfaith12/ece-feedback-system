import { ChevronDown } from "lucide-react";
import { useCallback, useRef, useState, type ReactNode } from "react";
import { PortalMenu } from "@/components/ui/PortalMenu";

export function DropdownMenu({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => setOpen(false), []);

  return (
    <div>
      <button
        ref={anchorRef}
        className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-emerald-700"
        onMouseEnter={() => setOpen(true)}
        onClick={() => setOpen((value) => !value)}
      >
        {label}
        <ChevronDown className={`size-4 transition ${open ? "rotate-180" : ""}`} />
      </button>
      <PortalMenu open={open} anchorRef={anchorRef} onClose={close} width={256}>
        {children}
      </PortalMenu>
    </div>
  );
}

export function DropdownLink({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="block w-full rounded-2xl px-3 py-2 text-left text-sm text-slate-200 transition hover:bg-cyan-300/10 hover:text-cyan-100">
      {children}
    </button>
  );
}
