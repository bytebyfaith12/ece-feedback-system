import { AnimatePresence, motion } from "framer-motion";
import { BarChart3, BookOpen, ChevronDown, Globe2, Headphones, Menu, MonitorSmartphone, Sparkles, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ProfileMenu } from "@/components/layout/ProfileMenu";
import { PortalMenu } from "@/components/ui/PortalMenu";

interface MenuColumn {
  title: string;
  links: Array<{ label: string; to: string; description?: string }>;
}

const solutionsColumns: MenuColumn[] = [
  {
    title: "Measure",
    links: [
      { label: "Feedback Kiosk", to: "/feedback/restroom", description: "Touchscreen one-tap feedback" },
      { label: "QR Feedback", to: "/qr-feedback", description: "Mobile scans for quick surveys" },
      { label: "Mobile Feedback", to: "/feedback", description: "Agent-friendly web forms" },
      { label: "Smart TV Wallboard", to: "/tv-wallboard", description: "Large operations display" },
    ],
  },
  {
    title: "Analyze",
    links: [
      { label: "Executive Dashboard", to: "/dashboard", description: "Satisfaction command center" },
      { label: "AI Analytics", to: "/ai-analytics", description: "Sentiment and root causes" },
      { label: "Reports Center", to: "/reports", description: "Exportable performance reports" },
      { label: "Heatmaps", to: "/sites", description: "Site and floor comparisons" },
    ],
  },
  {
    title: "Improve",
    links: [
      { label: "Ticketing Integration", to: "/tickets", description: "Action items with SLA owners" },
      { label: "Alert Center", to: "/alerts", description: "Critical issue routing" },
      { label: "SLA Monitoring", to: "/stl-dashboard", description: "Team-level follow through" },
      { label: "Facilities Management", to: "/facilities", description: "Workplace service quality" },
    ],
  },
];

const industryColumns: MenuColumn[] = [
  {
    title: "BPO Operations",
    links: [
      { label: "Production Floors", to: "/employee-satisfaction" },
      { label: "Training Rooms", to: "/training" },
      { label: "Recruitment Areas", to: "/recruitment" },
      { label: "Client Visit Areas", to: "/visitor-feedback" },
    ],
  },
  {
    title: "Employee Experience",
    links: [
      { label: "HR Support", to: "/hr-support" },
      { label: "Payroll Support", to: "/payroll-support" },
      { label: "Employee Satisfaction", to: "/employee-satisfaction" },
      { label: "AC Comfort", to: "/ac-comfort" },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "IT Service Feedback", to: "/it-service" },
      { label: "Facilities Management", to: "/facilities" },
      { label: "Security Professionalism", to: "/security" },
      { label: "WiFi Quality", to: "/wifi-quality" },
    ],
  },
];

const editionsColumns: MenuColumn[] = [
  {
    title: "Editions",
    links: [
      { label: "Executive Command Center", to: "/dashboard" },
      { label: "Operations Floor Pulse", to: "/stl-dashboard" },
      { label: "Technician Monitoring", to: "/technician" },
      { label: "Kiosk Experience", to: "/feedback" },
    ],
  },
];

const insightsColumns: MenuColumn[] = [
  {
    title: "Insights",
    links: [
      { label: "Reports Center", to: "/reports" },
      { label: "AI Recommendations", to: "/ai-analytics" },
      { label: "Device Health", to: "/device-monitoring" },
      { label: "Site Management", to: "/sites" },
    ],
  },
];

const aboutColumns: MenuColumn[] = [
  {
    title: "ECE Pulse",
    links: [
      { label: "About the Platform", to: "/" },
      { label: "Security", to: "/settings" },
      { label: "Admin Panel", to: "/admin" },
      { label: "Customer Support", to: "/alerts" },
    ],
  },
];

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-3 rounded-2xl pr-2 transition hover:opacity-90">
      <span className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-400 text-lg font-black text-white shadow-lg shadow-emerald-200">
        E
      </span>
      <span className="leading-tight">
        <span className="block text-lg font-black tracking-tight text-slate-950">ECE Pulse</span>
        <span className="block text-xs font-semibold text-slate-500">Feedback System</span>
      </span>
    </Link>
  );
}

function MegaMenu({
  id,
  label,
  columns,
  panel,
  activeDropdown,
  onOpen,
  onClose,
  onScheduleClose,
  onCancelClose,
}: {
  id: string;
  label: string;
  columns: MenuColumn[];
  panel?: ReactNode;
  activeDropdown: string | null;
  onOpen: (id: string) => void;
  onClose: () => void;
  onScheduleClose: () => void;
  onCancelClose: () => void;
}) {
  const anchorRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();
  const open = activeDropdown === id;
  const active = useMemo(() => columns.some((column) => column.links.some((link) => location.pathname === link.to)), [columns, location.pathname]);

  return (
    <div onMouseEnter={() => { onCancelClose(); onOpen(id); }} onMouseLeave={onScheduleClose}>
      <button
        ref={anchorRef}
        onClick={() => (open ? onClose() : onOpen(id))}
        className={`inline-flex min-h-11 items-center gap-1 rounded-full px-3 text-sm font-bold transition ${
          active || open ? "bg-emerald-50 text-emerald-700" : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
        }`}
      >
        {label}
        <ChevronDown className={`size-4 transition ${open ? "rotate-180" : ""}`} />
      </button>
      <PortalMenu open={open} anchorRef={anchorRef} onClose={onClose} align="center" width={760} className="ece-topnav-dropdown-panel overflow-hidden p-0" onMouseEnter={onCancelClose} onMouseLeave={onScheduleClose}>
        <div className="h-1 bg-gradient-to-r from-emerald-400 via-cyan-300 to-emerald-400" />
        <div className="grid grid-cols-[1fr_260px]">
          <div className={`grid gap-4 p-6 ${columns.length > 1 ? "grid-cols-3" : "grid-cols-1"}`}>
            {columns.map((column) => (
              <div key={column.title}>
                <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-cyan-100/60">{column.title}</p>
                <div className="space-y-1">
                  {column.links.map((link) => (
                    <Link
                      key={link.label}
                      to={link.to}
                      className="block rounded-2xl px-3 py-2 transition hover:bg-cyan-300/10"
                      onClick={onClose}
                    >
                      <span className="block text-sm font-bold text-white">{link.label}</span>
                      {link.description ? <span className="mt-0.5 block text-xs leading-5 text-slate-400">{link.description}</span> : null}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="border-l border-cyan-300/10 bg-white/[0.03] p-6">{panel}</div>
        </div>
      </PortalMenu>
    </div>
  );
}

function StoryPanel() {
  return (
    <div className="space-y-4">
      <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
        <Sparkles className="size-5" />
      </div>
      <div>
        <p className="text-sm font-black text-white">Customer Stories</p>
        <p className="mt-1 text-sm leading-6 text-slate-400">ECE teams improve workplace response with one-tap feedback and action routing.</p>
      </div>
      {["IT support satisfaction improved", "Facilities issues resolved faster", "Leaders get cleaner reports"].map((item) => (
        <Link key={item} to="/reports" className="flex items-center gap-3 rounded-2xl bg-white/[0.04] p-3 text-sm font-semibold text-slate-200 shadow-sm transition hover:bg-cyan-300/10 hover:text-cyan-100">
          <span className="size-2 rounded-full bg-emerald-500" />
          {item}
        </Link>
      ))}
      <Link to="/dashboard" className="inline-flex text-sm font-black text-cyan-200">
        View all customer stories
      </Link>
    </div>
  );
}

function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const links = [
    { label: "Home", to: "/" },
    { label: "Give Feedback", to: "/feedback" },
    { label: "Dashboard", to: "/dashboard" },
    { label: "Reports", to: "/reports" },
    { label: "AI Analytics", to: "/ai-analytics" },
    { label: "Device Monitoring", to: "/device-monitoring" },
    { label: "Alerts", to: "/alerts" },
    { label: "Admin", to: "/admin" },
  ];
  const sections = [
    ["Solutions", solutionsColumns],
    ["Editions", editionsColumns],
    ["Industry", industryColumns],
    ["Insights", insightsColumns],
    ["About Us", aboutColumns],
  ] as const;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[10000] bg-slate-950/40 backdrop-blur-sm lg:hidden">
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="ml-auto flex h-full w-[min(420px,92vw)] flex-col bg-white p-5 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <Logo />
              <button onClick={onClose} className="grid size-11 place-items-center rounded-full bg-slate-100 text-slate-700">
                <X className="size-5" />
              </button>
            </div>
            <div className="mt-8 grid gap-2">
              {sections.map(([label, columns]) => {
                const id = label.toLowerCase().replace(/\s+/g, "-");
                const expanded = openSection === id;
                return (
                  <div key={label} className="rounded-2xl border border-slate-100 bg-slate-50/70">
                    <button onClick={() => setOpenSection(expanded ? null : id)} className="flex w-full items-center justify-between px-4 py-3 text-left text-base font-bold text-slate-800">
                      {label}
                      <ChevronDown className={`size-4 transition ${expanded ? "rotate-180" : ""}`} />
                    </button>
                    {expanded ? (
                      <div className="border-t border-slate-100 p-2">
                        {columns.flatMap((column) => column.links).map((link) => (
                          <Link key={`${label}-${link.label}`} to={link.to} onClick={onClose} className="block rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700">
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })}
              {links.map((link) => (
                <Link key={link.label} to={link.to} onClick={onClose} className="rounded-2xl px-4 py-3 text-base font-bold text-slate-800 transition hover:bg-emerald-50 hover:text-emerald-700">
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="mt-auto space-y-3 rounded-3xl bg-emerald-50 p-5">
              <p className="text-sm font-bold text-emerald-900">Ready to collect workplace feedback?</p>
              <Link to="/feedback" onClick={onClose} className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-emerald-600 px-5 text-sm font-black text-white">
                Start Feedback
              </Link>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function TopNavbar() {
  const location = useLocation();
  const navRef = useRef<HTMLElement>(null);
  const closeTimerRef = useRef<number | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const closeDropdown = useCallback(() => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setActiveDropdown(null);
  }, []);

  const cancelCloseDropdown = useCallback(() => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const openDropdown = useCallback((id: string) => {
    cancelCloseDropdown();
    setActiveDropdown(id);
  }, [cancelCloseDropdown]);

  const scheduleCloseDropdown = useCallback(() => {
    cancelCloseDropdown();
    closeTimerRef.current = window.setTimeout(() => {
      setActiveDropdown(null);
      closeTimerRef.current = null;
    }, 120);
  }, [cancelCloseDropdown]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    closeDropdown();
    setMobileOpen(false);
  }, [closeDropdown, location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const element = event.target as Element;
      if (navRef.current?.contains(target)) return;
      if (element.closest?.(".ece-topnav-dropdown-panel")) return;
      closeDropdown();
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeDropdown();
        setMobileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
      cancelCloseDropdown();
    };
  }, [cancelCloseDropdown, closeDropdown]);

  return (
    <>
      <header ref={navRef} className={`sticky top-0 z-[2000] border-b border-slate-100 bg-white/95 backdrop-blur-xl transition ${scrolled ? "shadow-lg shadow-slate-200/60" : ""}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-4 py-3 sm:px-6 lg:px-8">
          <Logo />
          <nav className="hidden items-center gap-1 lg:flex">
            <MegaMenu id="solutions" label="Solutions" columns={solutionsColumns} panel={<StoryPanel />} activeDropdown={activeDropdown} onOpen={openDropdown} onClose={closeDropdown} onScheduleClose={scheduleCloseDropdown} onCancelClose={cancelCloseDropdown} />
            <MegaMenu id="editions" label="Editions" columns={editionsColumns} panel={<MenuPanel icon={<MonitorSmartphone className="size-5" />} title="Built for every screen" text="Desktop, mobile, kiosk, and TV wallboard views are included." />} activeDropdown={activeDropdown} onOpen={openDropdown} onClose={closeDropdown} onScheduleClose={scheduleCloseDropdown} onCancelClose={cancelCloseDropdown} />
            <MegaMenu id="industry" label="Industry" columns={industryColumns} panel={<StoryPanel />} activeDropdown={activeDropdown} onOpen={openDropdown} onClose={closeDropdown} onScheduleClose={scheduleCloseDropdown} onCancelClose={cancelCloseDropdown} />
            <MegaMenu id="insights" label="Insights" columns={insightsColumns} panel={<MenuPanel icon={<BarChart3 className="size-5" />} title="Actionable analytics" text="Follow sentiment, sites, alerts, devices, tickets, and reports in one place." />} activeDropdown={activeDropdown} onOpen={openDropdown} onClose={closeDropdown} onScheduleClose={scheduleCloseDropdown} onCancelClose={cancelCloseDropdown} />
            <MegaMenu id="about" label="About Us" columns={aboutColumns} panel={<MenuPanel icon={<BookOpen className="size-5" />} title="ECE Contact Centers" text="A workplace feedback ecosystem for BPO operations and support teams." />} activeDropdown={activeDropdown} onOpen={openDropdown} onClose={closeDropdown} onScheduleClose={scheduleCloseDropdown} onCancelClose={cancelCloseDropdown} />
            <NavLink
              to="/feedback"
              onMouseEnter={closeDropdown}
              className={({ isActive }) =>
                `inline-flex min-h-11 items-center rounded-full px-3 text-sm font-bold transition ${
                  isActive ? "bg-emerald-50 text-emerald-700" : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                }`
              }
            >
              Get Started
            </NavLink>
          </nav>
          <div className="hidden items-center gap-3 lg:flex">
            <Link to="/login" onMouseEnter={closeDropdown} className="text-sm font-semibold text-slate-600 transition hover:text-emerald-700">
              Sign in
            </Link>
            <Link to="/alerts" onMouseEnter={closeDropdown} className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 transition hover:text-emerald-700">
              <Headphones className="size-4" />
              Customer Support
            </Link>
            <button onMouseEnter={closeDropdown} className="inline-flex items-center gap-1 rounded-full px-2 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100">
              English
              <Globe2 className="size-4" />
            </button>
            <Link to="/signup" onMouseEnter={closeDropdown} className="inline-flex min-h-11 items-center rounded-full bg-emerald-600 px-5 text-sm font-black text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-700">
              Get a Quote
            </Link>
            <ProfileMenu />
          </div>
          <button onClick={() => setMobileOpen(true)} className="grid size-11 place-items-center rounded-full bg-slate-100 text-slate-700 lg:hidden">
            <Menu className="size-5" />
          </button>
        </div>
      </header>
      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}

function MenuPanel({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="space-y-4">
      <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700">{icon}</div>
      <div>
        <p className="text-sm font-black text-white">{title}</p>
        <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
      </div>
      <Link to="/dashboard" className="inline-flex rounded-full bg-cyan-300 px-4 py-2 text-sm font-black text-[#031017] transition hover:bg-emerald-300">
        Explore platform
      </Link>
    </div>
  );
}
