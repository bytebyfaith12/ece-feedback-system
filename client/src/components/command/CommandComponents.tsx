import { AnimatePresence, motion } from "framer-motion";
import { Bell, ChevronDown, Menu, Search, X } from "lucide-react";
import { Children, isValidElement, useCallback, useRef, useState, type ChangeEvent, type ReactElement, type ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { appRoles, dashboardFilters, ratingOptions } from "@/data/commandCenterData";
import { useCommandCenter, type CaseStatus, type Priority, type RatingLabel } from "@/store/commandCenterStore";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { PortalMenu } from "@/components/ui/PortalMenu";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function GlassCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={cn(
        "relative overflow-hidden rounded-3xl border border-white/[0.06] bg-[linear-gradient(135deg,rgba(28,43,60,0.42),rgba(5,20,36,0.68))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_24px_rgba(0,221,221,0.05)] backdrop-blur-2xl transition",
        "before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:bg-[linear-gradient(135deg,rgba(0,251,251,0.16),transparent_46%)] before:opacity-70",
        className,
      )}
    >
      <div className="relative z-10">{children}</div>
    </motion.section>
  );
}

export function EmptyState({ title, text = "Data will appear once real feedback is submitted." }: { title: string; text?: string }) {
  return (
    <div className="relative grid min-h-48 place-items-center overflow-hidden rounded-2xl border border-dashed border-cyan-300/20 bg-[#010f1f]/45 p-8 text-center">
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(rgba(0,251,251,.45) 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
      <div>
        <div className="mx-auto grid size-14 place-items-center rounded-full border border-cyan-300/20 bg-cyan-300/10 text-2xl text-cyan-200">◇</div>
        <p className="mt-4 text-base font-black text-white">{title}</p>
        <p className="mt-2 text-sm text-[#94a3b8]">{text}</p>
      </div>
    </div>
  );
}

export function KpiCard({ label, value, helper, tone = "cyan" }: { label: string; value: string | number; helper: string; tone?: "cyan" | "green" | "yellow" | "orange" | "red" }) {
  const colors = {
    cyan: "text-cyan-300 border-cyan-300/30",
    green: "text-emerald-300 border-emerald-300/30",
    yellow: "text-yellow-300 border-yellow-300/30",
    orange: "text-orange-300 border-orange-300/30",
    red: "text-red-300 border-red-300/30",
  };
  return (
    <GlassCard>
      <div className="flex items-start justify-between">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{label}</p>
        <span className={cn("rounded-full border px-2.5 py-1 text-[10px] font-black", colors[tone])}>{tone}</span>
      </div>
      <p className="mt-5 text-[34px] font-black leading-tight tracking-[-0.03em] text-white">{value}</p>
      <p className="mt-3 text-sm text-[#94a3b8]">{helper}</p>
    </GlassCard>
  );
}

export function SectionTitle({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.22em] text-[#00dddd]">{eyebrow}</p>
      <h1 className="mt-3 text-[28px] font-black leading-tight tracking-[-0.02em] text-white sm:text-[34px]">{title}</h1>
      {text ? <p className="mt-3 max-w-3xl text-[15px] leading-7 text-[#b9cac9]">{text}</p> : null}
    </div>
  );
}

export function PageFrame({ eyebrow, title, text, children }: { eyebrow: string; title: string; text?: string; children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[#051424] text-[#d4e4fa]">
      <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-8">
        <SectionTitle eyebrow={eyebrow} title={title} text={text} />
        <div className="mt-8">{children}</div>
      </div>
    </main>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const styles: Record<Priority, string> = {
    Low: "bg-cyan-300/10 text-cyan-200 border-cyan-300/20",
    Medium: "bg-yellow-300/10 text-yellow-200 border-yellow-300/20",
    High: "bg-orange-300/10 text-orange-200 border-orange-300/20",
    Critical: "bg-red-300/10 text-red-200 border-red-300/20",
  };
  return <span className={cn("rounded-full border px-3 py-1 text-xs font-black", styles[priority])}>{priority}</span>;
}

export function StatusBadge({ status }: { status: CaseStatus }) {
  const resolved = ["Resolved", "Closed"].includes(status);
  const warning = ["Escalated", "On Hold"].includes(status);
  return (
    <span
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-black",
        resolved && "border-emerald-300/20 bg-emerald-300/10 text-emerald-200",
        warning && "border-orange-300/20 bg-orange-300/10 text-orange-200",
        !resolved && !warning && "border-cyan-300/20 bg-cyan-300/10 text-cyan-200",
      )}
    >
      {status}
    </span>
  );
}

export function SmileyRating({ value, onChange }: { value?: RatingLabel; onChange: (label: RatingLabel, score: number) => void }) {
  return (
    <div className="grid gap-3 sm:grid-cols-5">
      {ratingOptions.map((option) => (
        <motion.button
          key={option.label}
          type="button"
          whileTap={{ scale: 0.9 }}
          whileHover={{ y: -5 }}
          onClick={() => onChange(option.label, option.score)}
          className={cn(
            "rounded-[20px] border p-4 text-center transition",
            value === option.label ? "border-cyan-300 bg-cyan-300/15 shadow-[0_0_18px_rgba(0,242,254,0.22)]" : "border-white/10 bg-white/[0.035] hover:border-cyan-300/40",
          )}
        >
          <motion.span animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2.2 }} className="block text-4xl">
            {option.emoji}
          </motion.span>
          <span className="mt-3 block text-xs font-black text-white">{option.label}</span>
        </motion.button>
      ))}
    </div>
  );
}

export function FilterBar({ compact = false }: { compact?: boolean }) {
  return (
    <GlassCard className="mb-5">
      <div className={cn("grid gap-2", compact ? "md:grid-cols-4" : "md:grid-cols-4 xl:grid-cols-8")}>
        {dashboardFilters.map((label) => (
          <CustomSelect key={label} value={label === "Date range" ? "Last 30 days" : `All ${label}`} onChange={() => undefined} options={[label === "Date range" ? "Last 30 days" : `All ${label}`]} />
        ))}
      </div>
    </GlassCard>
  );
}

export function Modal({ title, open, onClose, children }: { title: string; open: boolean; onClose: () => void; children: ReactNode }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="fixed inset-0 z-[10000] grid place-items-center bg-black/60 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 24, scale: 0.96 }} className="w-full max-w-2xl rounded-[28px] border border-cyan-300/25 bg-[#122131] p-6 text-white shadow-[0_0_28px_rgba(0,221,221,.14)]">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-black">{title}</h2>
              <button onClick={onClose} className="grid size-10 place-items-center rounded-full bg-white/10 text-slate-300 hover:text-white">
                <X className="size-5" />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function EmptyChart({ children }: { children?: ReactNode }) {
  return <EmptyState title="No feedback submitted yet" text={children ? "Data will appear once real feedback is submitted." : "Waiting for first response."} />;
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn("h-11 w-full rounded-xl border border-white/10 bg-[#010f1f]/70 px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300 focus:shadow-[inset_0_0_12px_rgba(0,221,221,.08)]", props.className)} />;
}

export function SelectInput({ children, value, defaultValue, onChange, className, disabled }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const options = Children.toArray(children)
    .filter(isValidElement)
    .map((child) => {
      const option = child as ReactElement<{ value?: string; children?: ReactNode }>;
      const label = String(option.props.children ?? option.props.value ?? "");
      return { value: option.props.value ?? label, label };
    });

  return (
    <CustomSelect
      className={className}
      value={String(value ?? defaultValue ?? "")}
      disabled={disabled}
      options={options}
      onChange={(nextValue) => onChange?.({ target: { value: nextValue }, currentTarget: { value: nextValue } } as ChangeEvent<HTMLSelectElement>)}
    />
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.16em] text-[#94a3b8]">{label}</span>
      {children}
    </label>
  );
}

export const navItems = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Submit Feedback", to: "/submit-feedback" },
  { label: "Pulse Feed", to: "/pulse-feed" },
  { label: "Analytics", to: "/analytics" },
  { label: "Sites", to: "/sites" },
  { label: "Accounts", to: "/accounts" },
  { label: "Categories", to: "/categories" },
  { label: "Alerts", to: "/alerts" },
  { label: "Reports", to: "/reports" },
];

export function CommandTopNav() {
  const [open, setOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const adminAnchorRef = useRef<HTMLButtonElement>(null);
  const closeAdmin = useCallback(() => setAdminOpen(false), []);
  const navigate = useNavigate();
  const currentRole = useCommandCenter((state) => state.currentRole);
  const setCurrentRole = useCommandCenter((state) => state.setCurrentRole);
  const alerts = useCommandCenter((state) => state.alerts);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn("rounded-xl px-3 py-2 text-[13px] font-bold transition", isActive ? "bg-cyan-300 text-[#010f1f] shadow-[0_0_14px_rgba(0,251,251,.24)]" : "text-slate-300 hover:bg-white/10 hover:text-white");

  return (
    <header className="sticky top-0 z-[2000] border-b border-white/[0.06] bg-[#010f1f]/88 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate("/")} className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-cyan-300 text-base font-black text-[#010f1f] shadow-[0_0_18px_rgba(0,251,251,0.3)]">E</span>
          <span className="hidden leading-tight sm:block">
            <span className="block text-[15px] font-black text-white">ECE Pulse</span>
            <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200">Executive Command</span>
          </span>
        </button>

        <nav className="hidden items-center gap-1 xl:flex">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={navLinkClass}>
              {item.label}
            </NavLink>
          ))}
          <div>
            <button ref={adminAnchorRef} onClick={() => setAdminOpen((value) => !value)} className="inline-flex items-center gap-1 rounded-xl px-3 py-2 text-[13px] font-bold text-slate-300 hover:bg-white/10 hover:text-white">
              Admin <ChevronDown className="size-4" />
            </button>
            <PortalMenu open={adminOpen} anchorRef={adminAnchorRef} onClose={closeAdmin} align="right" width={224}>
              {[
                ["Admin Settings", "/admin"],
                ["User Management", "/users"],
                ["Audit Logs", "/audit-logs"],
              ].map(([label, to]) => (
                <button key={to} onClick={() => { navigate(to); closeAdmin(); }} className="block w-full rounded-2xl px-4 py-3 text-left text-sm font-bold text-slate-200 hover:bg-cyan-300/10">
                  {label}
                </button>
              ))}
            </PortalMenu>
          </div>
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
            <input placeholder="Search cases..." className="h-10 w-48 rounded-2xl border border-white/10 bg-white/[0.04] pl-9 pr-3 text-sm text-white outline-none focus:border-cyan-300" />
          </div>
          <button className="relative grid size-10 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-slate-300">
            <Bell className="size-4" />
            {alerts.length ? <span className="absolute right-1 top-1 size-2 rounded-full bg-red-400" /> : null}
          </button>
          <div className="w-36"><CustomSelect value={currentRole} onChange={(value) => setCurrentRole(value as (typeof appRoles)[number])} options={[...appRoles]} /></div>
          <button onClick={() => navigate("/login")} className="rounded-2xl bg-cyan-300 px-4 py-2 text-sm font-black text-[#010f1f]">Logout</button>
        </div>

        <button onClick={() => setOpen(true)} className="grid size-11 place-items-center rounded-full bg-white/10 text-white xl:hidden">
          <Menu className="size-5" />
        </button>
      </div>
      <AnimatePresence>
        {open ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm xl:hidden">
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} className="ml-auto h-full w-[min(420px,92vw)] overflow-y-auto bg-[#010f1f] p-5">
              <div className="mb-8 flex items-center justify-between">
                <span className="text-lg font-black text-white">ECE Pulse</span>
                <button onClick={() => setOpen(false)} className="grid size-10 place-items-center rounded-full bg-white/10 text-white">
                  <X className="size-5" />
                </button>
              </div>
              {[...navItems, { label: "Admin Settings", to: "/admin" }, { label: "User Management", to: "/users" }, { label: "Audit Logs", to: "/audit-logs" }].map((item) => (
                <NavLink key={item.to} to={item.to} onClick={() => setOpen(false)} className="mb-2 block rounded-2xl px-4 py-3 text-base font-bold text-slate-200 hover:bg-cyan-300/10">
                  {item.label}
                </NavLink>
              ))}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
