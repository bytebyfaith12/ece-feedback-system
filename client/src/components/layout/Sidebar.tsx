import { motion } from "framer-motion";
import { BarChart3, Bell, Building2, ChevronLeft, ClipboardList, Cog, FileText, HeartPulse, Home, Laptop, MapPin, Monitor, QrCode, Radio, SmilePlus, Ticket, Tv, Users } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useFeedbackStore } from "@/store/useFeedbackStore";
import { cn } from "@/utils/cn";

const groups = [
  { label: "Overview", items: [["Dashboard", "/dashboard", BarChart3], ["Pulse Feed", "/pulse-feed", HeartPulse], ["Analytics", "/analytics", Monitor], ["Smart TV", "/tv", Tv]] },
  { label: "Feedback", items: [["Submit Feedback", "/submit-feedback", SmilePlus], ["QR Feedback", "/qr", QrCode], ["Feedback Inbox", "/feedback", ClipboardList]] },
  { label: "Operations", items: [["Sites", "/sites", MapPin], ["Accounts", "/accounts", Building2], ["Categories", "/categories", ClipboardList], ["Alerts", "/alerts", Bell], ["Tickets", "/tickets", Ticket], ["Devices", "/devices", Laptop]] },
  { label: "Departments", items: [["Employee Pulse", "/employee-pulse", Users], ["IT Feedback", "/it-feedback", Monitor], ["Facilities", "/facilities", Building2], ["HR Satisfaction", "/hr-satisfaction", Users], ["Recruitment", "/recruitment", ClipboardList], ["Visitor Welcome", "/visitor-welcome", SmilePlus], ["Training", "/training", FileText], ["STL Dashboard", "/stl", Home]] },
  { label: "Management", items: [["Reports", "/reports", FileText], ["Admin", "/admin", Cog]] },
] as const;

export function Sidebar() {
  const collapsed = useFeedbackStore((state) => state.sidebarCollapsed);
  const toggle = useFeedbackStore((state) => state.toggleSidebar);
  return (
    <motion.aside animate={{ width: collapsed ? 64 : 256 }} className="fixed inset-y-0 left-0 z-[1000] hidden border-r border-cyan-300/10 bg-[#051018]/95 shadow-[18px_0_60px_rgba(0,0,0,0.35)] backdrop-blur-xl lg:block">
      <div className="flex h-full flex-col">
        <div className="flex h-24 items-center gap-3 px-4">
          <div className="relative grid size-12 shrink-0 place-items-center rounded-[1.15rem] bg-gradient-to-br from-cyan-300 to-emerald-300 text-[#031017] shadow-[0_0_30px_rgba(0,242,254,0.35)]">
            <span className="absolute inset-[-7px] rounded-[1.45rem] border border-cyan-300/30 animate-echo-radar" />
            <span className="logo-font text-xl">E</span>
          </div>
          {!collapsed ? <div><p className="logo-font text-lg text-white">ECE Echo</p><p className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-200"><Radio className="size-3" />Feedback Command</p></div> : null}
        </div>
        <div className="px-3">{!collapsed ? <button className="mb-4 w-full rounded-2xl border border-cyan-300/25 bg-cyan-300 px-4 py-3 text-sm font-extrabold text-[#031017] shadow-[0_0_26px_rgba(0,242,254,0.25)] hover:bg-emerald-300">+ New Report</button> : null}</div>
        <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
          {groups.map((group) => (
            <div key={group.label}>
              {!collapsed ? <p className="mb-2 px-3 text-[10px] font-extrabold uppercase tracking-[0.2em] text-cyan-100/45">{group.label}</p> : null}
              <div className="space-y-1">
                {group.items.map(([label, to, Icon]) => (
                  <NavLink key={to} to={to} className={({ isActive }) => cn("flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition", isActive ? "border border-cyan-300/30 bg-cyan-300/12 text-cyan-100 shadow-[0_0_18px_rgba(0,242,254,0.12)]" : "text-slate-400 hover:bg-cyan-300/8 hover:text-cyan-100", collapsed && "justify-center px-2")}>
                    <Icon className="size-5 shrink-0" />
                    {!collapsed ? label : null}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="border-t border-cyan-300/10 p-3">
          <button onClick={toggle} className="flex w-full items-center justify-center rounded-2xl border border-cyan-300/15 bg-white/[0.03] py-2 text-cyan-100/60 hover:bg-cyan-300/10"><ChevronLeft className={cn("size-4 transition", collapsed && "rotate-180")} /></button>
        </div>
      </div>
    </motion.aside>
  );
}
