import { Bell, ChevronDown, LogOut, Menu, Search } from "lucide-react";
import { format } from "date-fns";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useFeedbackStore } from "@/store/useFeedbackStore";
import { cn } from "@/utils/cn";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { PortalMenu } from "@/components/ui/PortalMenu";

function titleFromPath(pathname: string) {
  if (pathname === "/") return "Home";
  return pathname.split("/").filter(Boolean)[0]?.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) ?? "Dashboard";
}

const navItems = [
  ["Dashboard", "/dashboard"],
  ["Submit Feedback", "/submit-feedback"],
  ["Pulse Feed", "/pulse-feed"],
  ["Analytics", "/analytics"],
  ["Sites", "/sites"],
  ["Alerts", "/alerts"],
  ["Reports", "/reports"],
] as const;

export function Topbar() {
  const toggle = useFeedbackStore((state) => state.toggleSidebar);
  const alerts = useFeedbackStore((state) => state.alerts);
  const user = useFeedbackStore((state) => state.user);
  const logout = useFeedbackStore((state) => state.logout);
  const location = useLocation();
  const navigate = useNavigate();
  const [now, setNow] = useState(new Date());
  const [adminOpen, setAdminOpen] = useState(false);
  const adminAnchorRef = useRef<HTMLButtonElement>(null);
  const closeAdmin = useCallback(() => setAdminOpen(false), []);
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const activeAlerts = alerts.filter((alert) => !["resolved", "dismissed"].includes(alert.status)).length;
  return (
    <header className="sticky top-0 z-[2000] border-b border-cyan-300/10 bg-[#061018]/90 shadow-[0_12px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <div className="flex min-h-20 items-center gap-4 px-4 md:px-6">
        <button onClick={toggle} className="grid size-10 place-items-center rounded-2xl border border-cyan-300/20 bg-white/[0.03] text-cyan-100 hover:border-cyan-300/40 hover:bg-cyan-300/10"><Menu className="size-5" /></button>
        <div className="min-w-0">
          <h1 className="display-title text-lg text-white">{titleFromPath(location.pathname)}</h1>
          <p className="hidden text-xs text-cyan-100/55 md:block">ECE Echo &gt; {titleFromPath(location.pathname)}</p>
        </div>
        <nav className="hidden items-center gap-1 xl:flex">
          {navItems.map(([label, to]) => (
            <NavLink key={to} to={to} className={({ isActive }) => cn("rounded-full px-3 py-2 text-xs font-bold text-slate-300 transition hover:bg-cyan-300/10 hover:text-cyan-100", isActive && "bg-cyan-300/10 text-cyan-200")}>
              {label}
            </NavLink>
          ))}
          <div>
            <button ref={adminAnchorRef} onClick={() => setAdminOpen((value) => !value)} className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-xs font-bold text-slate-300 transition hover:bg-cyan-300/10 hover:text-cyan-100">
              Admin <ChevronDown className="size-3" />
            </button>
            <PortalMenu open={adminOpen} anchorRef={adminAnchorRef} onClose={closeAdmin} align="right" width={224}>
              {[["Admin Settings", "/admin"], ["User Management", "/users"], ["Audit Logs", "/audit-logs"]].map(([label, to]) => (
                <Link key={to} to={to} onClick={closeAdmin} className="block rounded-xl px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-cyan-300/10 hover:text-cyan-100">{label}</Link>
              ))}
            </PortalMenu>
          </div>
        </nav>
        <div className="mx-auto hidden max-w-md flex-1 md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-cyan-100/45" />
            <input className="h-11 w-full rounded-2xl border border-cyan-300/15 bg-white/[0.04] pl-10 pr-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20" placeholder="Search cases, sites, alerts..." />
          </div>
        </div>
        <div className="hidden w-36 lg:block"><CustomSelect value="All Sites" onChange={() => undefined} options={["All Sites", "Noel", "Macias", "Consuelo"]} /></div>
        <span className="hidden items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-200 md:inline-flex"><span className="size-2 rounded-full bg-emerald-300 animate-live-dot" />LIVE</span>
        <button className="relative grid size-10 place-items-center rounded-2xl border border-cyan-300/15 bg-white/[0.04] text-slate-200 hover:bg-cyan-300/10">
          <Bell className="size-5" />
          <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">{activeAlerts}</span>
        </button>
        <div className="hidden text-right lg:block">
          <p className="text-sm font-bold text-white">{user?.name ?? "ECE User"}</p>
          <p className="text-xs text-cyan-100/55">{format(now, "HH:mm:ss")}</p>
        </div>
        <button onClick={() => { logout(); navigate("/login", { replace: true }); }} className="hidden items-center gap-2 rounded-2xl bg-cyan-300 px-4 py-2.5 text-sm font-extrabold text-[#031017] transition hover:bg-emerald-300 md:inline-flex">
          <LogOut className="size-4" /> Logout
        </button>
      </div>
    </header>
  );
}
