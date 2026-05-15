import { motion } from "framer-motion";
import { format, isAfter, parseISO, subDays } from "date-fns";
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import type { ComponentProps, ComponentType, ReactNode } from "react";
import { ArrowRight, Building2, ChevronDown, Download, FileText, MapPin, Menu, Monitor, QrCode, Radio, ShieldCheck, Smile, Sparkles, Users, X } from "lucide-react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import type { FeedbackResponse, Location, LocationScope, SmileyRating } from "@/types/index";
import { Card } from "@/components/ui/Card";
import { KPICard } from "@/components/ui/KPICard";
import { HappinessScore } from "@/components/ui/HappinessScore";
import { HappinessBar } from "@/components/ui/HappinessBar";
import { FilterBar } from "@/components/ui/FilterBar";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SmileyBadge } from "@/components/ui/SmileyBadge";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { PortalMenu } from "@/components/ui/PortalMenu";
import { PageHeader } from "@/components/layout/PageHeader";
import { KioskTerminal } from "@/components/feedback/KioskTerminal";
import { QRLandingPage } from "@/components/feedback/QRLandingPage";
import { ProductionFeedbackForm } from "@/components/forms/ProductionFeedbackForm";
import { UserTable } from "@/components/admin/UserTable";
import { LocationManager } from "@/components/admin/LocationManager";
import { DeviceManager } from "@/components/admin/DeviceManager";
import { SurveyBuilder } from "@/components/admin/SurveyBuilder";
import { RolePermissions } from "@/components/admin/RolePermissions";
import { HappinessIndexChart } from "@/components/charts/HappinessIndexChart";
import { ResponseVolumeChart } from "@/components/charts/ResponseVolumeChart";
import { LocationComparisonChart } from "@/components/charts/LocationComparisonChart";
import { SmileyDistributionChart, distribution } from "@/components/charts/SmileyDistributionChart";
import { HourlyHeatmapChart } from "@/components/charts/HourlyHeatmapChart";
import { WeeklyComparisonChart } from "@/components/charts/WeeklyComparisonChart";
import { TrendSparkline } from "@/components/charts/TrendSparkline";
import { calculateHappinessIndex } from "@/utils/happinessCalculator";
import { formatShortDate, minutesUntil, timeAgo } from "@/utils/formatters";
import { useFeedbackStore } from "@/store/useFeedbackStore";
import { useExport } from "@/hooks/useExport";
import { configuredAccountCount, configuredSiteCount, feedbackCategories, siteAccounts } from "@/data/echoConfig";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { ParallaxSection } from "@/components/shared/ParallaxSection";
import { HeroSection } from "@/components/landing/HeroSection";
import { feedbackTypeCards } from "@/lib/feedbackConfig";

const ThreeParticleField = lazy(() => import("@/components/visual/ThreeParticleField").then((module) => ({ default: module.ThreeParticleField })));
type IconComponent = ComponentType<ComponentProps<typeof Radio>>;

function Page({ title, subtitle, children, actions }: { title: string; subtitle?: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <motion.main initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: "easeOut" }} className="p-4 md:p-6">
      <PageHeader title={title} subtitle={subtitle} actions={actions} />
      {children}
    </motion.main>
  );
}

function createFeedback(location: Location, rating: SmileyRating, followUps?: string[], comment?: string): FeedbackResponse {
  return {
    id: `FB-${Date.now()}`,
    fullName: "Anonymous",
    locationId: location.id,
    locationName: location.name,
    siteId: location.siteId,
    siteName: location.siteName,
    floor: location.floor,
    category: location.category,
    subcategory: `${location.category} pulse`,
    rating,
    priority: rating <= 2 ? "High" : "Low",
    status: rating <= 2 ? "New" : "Reviewed",
    assignedTeam: location.category,
    source: "Kiosk",
    followUpItems: followUps,
    comment,
    isAnonymous: true,
    respondentType: "employee",
    language: "EN",
    deviceId: location.kioskIds[0] ?? "QR-001",
    submittedAt: new Date().toISOString(),
    sessionDuration: 5,
  };
}

function recordsForToday(feedback: FeedbackResponse[]) {
  const today = new Date().toISOString().slice(0, 10);
  return feedback.filter((item) => item.submittedAt.slice(0, 10) === today);
}

function siteSummary(feedback: FeedbackResponse[], siteName: string) {
  const rows = feedback.filter((item) => item.siteName === siteName);
  return calculateHappinessIndex(rows, feedback.filter((item) => item.siteName === siteName && isAfter(parseISO(item.submittedAt), subDays(new Date(), 60))));
}

function LandingDropdown({
  id,
  label,
  items,
  active,
  onOpen,
  onClose,
  onScheduleClose,
  onCancelClose,
}: {
  id: string;
  label: string;
  items: string[];
  active: boolean;
  onOpen: (id: string) => void;
  onClose: () => void;
  onScheduleClose: () => void;
  onCancelClose: () => void;
}) {
  const anchorRef = useRef<HTMLButtonElement>(null);
  return (
    <div onMouseEnter={() => { onCancelClose(); onOpen(id); }} onMouseLeave={onScheduleClose}>
      <button ref={anchorRef} onClick={() => (active ? onClose() : onOpen(id))} className={`inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-bold transition ${active ? "bg-cyan-300/12 text-cyan-100 shadow-[0_0_18px_rgba(0,242,254,0.12)]" : "text-slate-200 hover:bg-cyan-300/10 hover:text-cyan-100"}`}>
        {label} <ChevronDown className="size-3" />
      </button>
      <PortalMenu open={active} anchorRef={anchorRef} onClose={onClose} width={288} className="ece-landing-dropdown-panel p-3" onMouseEnter={onCancelClose} onMouseLeave={onScheduleClose}>
        {items.map((item) => <Link key={item} to="/login" onClick={onClose} className="block rounded-2xl px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-cyan-300/10 hover:text-cyan-100">{item}</Link>)}
      </PortalMenu>
    </div>
  );
}

function AnimatedEchoHero() {
  const cards = [
    ["😄", "Great support", "Thank you, team!", "left-4 top-8"],
    ["🙂", "Quick pulse", "One tap feedback.", "right-4 top-20"],
    ["🙁", "Needs attention", "Routes to the right team.", "left-8 bottom-24"],
    ["▣", "Waiting for first response", "Dashboard starts from zero.", "right-6 bottom-12"],
  ];

  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ rotateX: 1.2, rotateY: -1.8 }} transition={{ delay: 0.12, duration: 0.55 }} style={{ transformPerspective: 1100 }} className="relative mx-auto w-full max-w-2xl">
      <div className="absolute -inset-10 rounded-[3rem] bg-cyan-300/15 blur-[80px]" />
      <div className="relative min-h-[520px] overflow-hidden rounded-[2.2rem] border border-cyan-300/25 bg-[#dffcff] p-5 shadow-[0_30px_120px_rgba(0,242,254,0.18)]">
        <Suspense fallback={null}><ThreeParticleField className="opacity-45 mix-blend-screen" density="low" /></Suspense>
        <div className="absolute inset-x-8 bottom-8 top-8 rounded-[2rem] bg-gradient-to-br from-cyan-100 via-white to-emerald-100 opacity-95" />
        <div className="absolute left-1/2 top-1/2 grid size-52 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-cyan-500/20 bg-white/55 text-[#031017] shadow-[0_0_70px_rgba(0,242,254,0.26)] backdrop-blur">
          <div className="relative grid size-24 place-items-center rounded-[2rem] bg-gradient-to-br from-cyan-300 to-emerald-300">
            <span className="absolute inset-[-18px] rounded-[2.8rem] border border-cyan-500/25 animate-echo-radar" />
            <span className="logo-font text-5xl">E</span>
          </div>
        </div>
        {cards.map(([emoji, title, text, position], index) => (
          <motion.div key={title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: [0, -8, 0] }} transition={{ opacity: { delay: 0.25 + index * 0.09 }, y: { repeat: Infinity, duration: 4 + index * 0.35, ease: "easeInOut" } }} whileHover={{ scale: 1.04 }} className={`absolute ${position} max-w-[210px] rounded-3xl bg-white/90 p-5 text-[#071225] shadow-[0_20px_50px_rgba(0,0,0,0.12)] backdrop-blur`}>
            <span className="text-3xl">{emoji}</span>
            <p className="mt-3 text-sm font-extrabold">{title}</p>
            <p className="mt-1 text-xs text-slate-500">{text}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export function LandingPage() {
  const location = useLocation();
  const feedback = useFeedbackStore((state) => state.feedback);
  const alerts = useFeedbackStore((state) => state.alerts);
  const authenticated = useFeedbackStore((state) => state.authenticated);
  const navRef = useRef<HTMLElement>(null);
  const closeTimerRef = useRef<number | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState("submit");
  const hi = calculateHappinessIndex(feedback);
  const features: Array<[string, string, IconComponent]> = [
    ["Signal captured", "Employees, applicants, visitors, and clients send one clear feedback signal.", Radio],
    ["AI categorizes", "ECE Echo sorts the signal by site, account, category, priority, and team.", Sparkles],
    ["Team resolves", "Alerts and cases appear only when real feedback requires action.", ShieldCheck],
  ];
  const navMenus = {
    Solutions: ["IT Service Feedback", "Facilities Feedback", "HR Support", "Payroll Support", "Visitor/Client Feedback", "Recruitment Experience", "Security Professionalism", "Training Feedback"],
    Platform: ["Executive Dashboard", "Feedback Kiosk", "QR Feedback", "Smart TV Wallboard", "Alerts & Escalation", "Ticketing Integration", "Admin Settings"],
    Analytics: ["Real-Time Monitoring", "AI Sentiment Analysis", "Reports Center", "Site Performance", "Account Performance", "Category Performance"],
    Resources: ["Documentation", "Help Center", "Feedback Guide", "Best Practices", "Release Notes"],
  };
  const faqs = [
    ["submit", "What happens after I submit feedback?", "Your submission is saved, assigned a submission ID, and appears in the admin dashboard. Negative ratings can create an alert for follow-up."],
    ["anonymous", "Is feedback anonymous?", "Yes. Turn on anonymous mode and your name is not required. Optional email is used only for follow-up if you provide it."],
    ["visibility", "Who can view my feedback?", "Authorized admins can view submissions and analytics. Normal users can submit feedback only."],
    ["again", "Can I submit another feedback?", "Yes. You can submit another feedback anytime from the Submit Feedback page."],
    ["data", "How is my data used?", "Feedback is used to understand site, service, recruitment, visitor, workplace, and account experience trends."],
  ];
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
    queueMicrotask(() => {
      closeDropdown();
      setMobileOpen(false);
    });
  }, [closeDropdown, location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const element = event.target as Element;
      if (navRef.current?.contains(target)) return;
      if (element.closest?.(".ece-landing-dropdown-panel")) return;
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
    <main className="overflow-hidden bg-[#030b12] text-slate-100">
      <nav ref={navRef} className="sticky top-0 z-[2000] border-b border-cyan-300/10 bg-[#051018]/88 backdrop-blur-xl">
        <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-4 px-4">
          <Link to="/" className="flex items-center gap-3">
            <span className="relative grid size-12 place-items-center rounded-[1.15rem] bg-gradient-to-br from-cyan-300 to-emerald-300 text-[#031017] shadow-[0_0_34px_rgba(0,242,254,0.32)]">
              <span className="absolute inset-[-8px] rounded-[1.45rem] border border-cyan-300/30 animate-echo-radar" />
              <span className="logo-font text-xl">E</span>
            </span>
            <span><b className="logo-font text-xl text-white">ECE Echo</b><span className="block text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-200">Feedback Command</span></span>
          </Link>
          <div className="hidden items-center gap-2 lg:flex">
            {Object.entries(navMenus).map(([label, items]) => <LandingDropdown key={label} id={label.toLowerCase()} label={label} items={items} active={activeDropdown === label.toLowerCase()} onOpen={openDropdown} onClose={closeDropdown} onScheduleClose={scheduleCloseDropdown} onCancelClose={cancelCloseDropdown} />)}
            <Link to="/signup" onMouseEnter={closeDropdown} className="rounded-full px-4 py-2 text-sm font-bold text-slate-200 hover:bg-cyan-300/10">Get Started</Link>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <Link to="/login" onMouseEnter={closeDropdown} className="text-sm font-bold text-slate-300 hover:text-cyan-200">Sign in</Link>
            <button onMouseEnter={closeDropdown} className="text-sm font-bold text-slate-300 hover:text-cyan-200">Support</button>
            <div className="w-24" onMouseEnter={closeDropdown} onClick={closeDropdown}><CustomSelect value="EN" onChange={() => undefined} options={["EN", "FIL"]} /></div>
            <Link to="/signup" onMouseEnter={closeDropdown} className="rounded-full bg-cyan-300 px-5 py-3 text-sm font-extrabold text-[#031017] hover:bg-emerald-300">Get Started</Link>
          </div>
          <button onClick={() => { closeDropdown(); setMobileOpen(true); }} className="grid size-11 place-items-center rounded-2xl border border-cyan-300/20 bg-white/[0.04] text-cyan-100 hover:bg-cyan-300/10 lg:hidden" aria-label="Open navigation menu">
            <Menu className="size-5" />
          </button>
        </div>
        {mobileOpen ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[10000] bg-[#020b12]/80 backdrop-blur-sm lg:hidden">
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 280, damping: 28 }} className="ml-auto flex h-full w-[min(420px,92vw)] flex-col overflow-y-auto border-l border-cyan-300/15 bg-[#071620] p-5 shadow-[-24px_0_70px_rgba(0,0,0,0.42)]">
              <div className="flex items-center justify-between">
                <span className="logo-font text-xl text-white">ECE Echo</span>
                <button onClick={() => setMobileOpen(false)} className="grid size-10 place-items-center rounded-full bg-white/[0.06] text-cyan-100" aria-label="Close navigation menu">
                  <X className="size-5" />
                </button>
              </div>
              <div className="mt-8 space-y-3">
                {Object.entries(navMenus).map(([label, items]) => {
                  const id = label.toLowerCase();
                  const open = mobileSection === id;
                  return (
                    <div key={label} className="rounded-2xl border border-cyan-300/12 bg-white/[0.035]">
                      <button onClick={() => setMobileSection(open ? null : id)} className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-extrabold text-slate-100">
                        {label}
                        <ChevronDown className={`size-4 transition ${open ? "rotate-180" : ""}`} />
                      </button>
                      {open ? (
                        <div className="border-t border-cyan-300/10 p-2">
                          {items.map((item) => <Link key={item} to="/login" onClick={() => setMobileOpen(false)} className="block rounded-xl px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-cyan-300/10 hover:text-cyan-100">{item}</Link>)}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
              <div className="mt-auto grid gap-3 pt-8">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="rounded-2xl border border-cyan-300/20 px-4 py-3 text-center text-sm font-bold text-cyan-100">Sign in</Link>
                <Link to="/signup" onClick={() => setMobileOpen(false)} className="rounded-2xl bg-cyan-300 px-4 py-3 text-center text-sm font-extrabold text-[#031017]">Get Started</Link>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </nav>

      <HeroSection feedback={feedback} alertsCount={alerts.length} authenticated={authenticated} />

      <section className="border-y border-cyan-300/10 bg-white/[0.025] py-8">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 text-center md:grid-cols-4">
          {[["Configured Sites", configuredSiteCount], ["Configured Accounts", configuredAccountCount], ["Submitted Feedback", feedback.length], ["Open Alerts", useFeedbackStore.getState().alerts.length]].map(([label, value]) => <div key={label}><p className="display-title text-2xl text-cyan-100">{value}</p><p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p></div>)}
        </div>
      </section>

      <ParallaxSection id="feedback-journey" className="mx-auto max-w-7xl px-4 py-24">
        <div className="absolute left-8 top-20 hidden h-[72%] w-px bg-gradient-to-b from-cyan-300/0 via-cyan-300/45 to-emerald-300/0 md:block" />
        <h2 className="display-title text-3xl text-white md:text-4xl">Feedback Journey</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {features.map(([title, text, Icon], index) => <ScrollReveal key={String(title)} delay={index * 0.08} className="echo-glass p-6"><Icon className="size-9 text-cyan-200" /><h3 className="mt-5 text-xl font-extrabold text-white">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-400">{text}</p></ScrollReveal>)}
        </div>
      </ParallaxSection>

      <ParallaxSection className="mx-auto max-w-7xl px-4 py-16" strength={28}>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-200">Feedback categories</p>
        <h2 className="display-title mt-3 text-3xl text-white md:text-4xl">Five Ways To Capture Better Signals</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {feedbackTypeCards.map(({ type, title, description, icon: Icon }, index) => (
            <motion.article key={type} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.35 }} transition={{ delay: index * 0.05 }} whileHover={{ y: -5 }} className="flex min-h-[250px] flex-col rounded-3xl border border-cyan-300/15 bg-white/[0.04] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.16)] backdrop-blur">
              <Icon className="size-8 text-emerald-200" />
              <h3 className="mt-5 text-lg font-extrabold text-white">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">{description}</p>
              <Link to={`/feedback/${type}`} className="mt-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 text-sm font-extrabold text-cyan-100 transition hover:bg-cyan-300 hover:text-[#031017]">
                Start form <ArrowRight className="size-4" />
              </Link>
            </motion.article>
          ))}
        </div>
      </ParallaxSection>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-20 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-200">Dashboard preview</p>
          <h2 className="display-title mt-3 text-3xl text-white md:text-4xl">Dark Command Center, Honest Data</h2>
          <p className="mt-4 text-slate-400">Every KPI starts at zero and updates only from actual submitted feedback. No fake launch numbers, no phantom alerts, no surprise toasts.</p>
        </div>
        <div className="echo-glass p-6">
          <div className="grid gap-4 md:grid-cols-3">
            {[["Total Feedback", feedback.length], ["Happiness", `${hi.score}%`], ["Cases", useFeedbackStore.getState().tickets.length]].map(([label, value]) => <div key={label} className="rounded-2xl bg-[#020b12] p-5"><p className="display-title text-2xl text-cyan-100">{value}</p><p className="mt-1 text-xs text-slate-500">{label}</p></div>)}
          </div>
          <div className="mt-5 rounded-3xl border border-cyan-300/10 bg-[#020b12] p-6">
            <div className="grid h-44 place-items-center rounded-2xl border border-dashed border-cyan-300/18 text-center">
              <div><Radio className="mx-auto mb-3 size-8 text-cyan-200 animate-echo-breathe" /><p className="font-bold text-white">Waiting for first feedback</p><p className="text-sm text-slate-500">Dashboard charts will draw after the first response.</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="mb-14 grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-200">FAQ</p>
            <h2 className="display-title mt-3 text-3xl text-white md:text-4xl">Clear Answers Before People Submit</h2>
            <p className="mt-4 text-sm leading-6 text-slate-400">Designed for agents, applicants, visitors, clients, and employees without exposing technical database language.</p>
          </div>
          <div className="space-y-3">
            {faqs.map(([id, question, answer]) => {
              const open = openFaq === id;
              return (
                <div key={id} className="rounded-3xl border border-cyan-300/15 bg-white/[0.04]">
                  <button onClick={() => setOpenFaq(open ? "" : id)} aria-expanded={open} aria-controls={`faq-${id}`} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-extrabold text-white">
                    {question}
                    <ChevronDown className={`size-4 shrink-0 text-cyan-100 transition ${open ? "rotate-180" : ""}`} />
                  </button>
                  {open ? <p id={`faq-${id}`} className="border-t border-cyan-300/10 px-5 pb-5 pt-4 text-sm leading-6 text-slate-400">{answer}</p> : null}
                </div>
              );
            })}
          </div>
        </div>
        <div className="rounded-[2rem] border border-emerald-300/20 bg-gradient-to-r from-cyan-300/15 to-emerald-300/15 p-8 text-center shadow-[0_0_80px_rgba(0,242,254,0.12)]">
          <h2 className="display-title text-3xl text-white">Ready to capture the first signal?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-300">Start with one response. ECE Echo will build the dashboard from real feedback only.</p>
          <Link to="/submit-feedback" className="mt-7 inline-flex rounded-2xl bg-cyan-300 px-6 py-3 font-extrabold text-[#031017] hover:bg-emerald-300">Submit First Feedback</Link>
        </div>
      </section>

      <footer className="border-t border-cyan-300/10 px-4 py-10 text-sm text-slate-500">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
          <div><p className="logo-font text-xl text-white">ECE Echo</p><p className="mt-2">Feedback & Satisfaction Command System.</p></div>
          <div><p className="font-bold text-slate-300">Version</p><p className="mt-2">Production-ready frontend 1.0</p></div>
          <div><p className="font-bold text-slate-300">Contact</p><p className="mt-2">ECE Contact Centers support team</p></div>
        </div>
        <p className="mx-auto mt-8 max-w-7xl border-t border-cyan-300/10 pt-6">© 2026 ECE Echo. All rights reserved.</p>
      </footer>
    </main>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useFeedbackStore((state) => state.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const from = (location.state as { from?: string } | null)?.from ?? "/dashboard";
  const submit = async () => {
    if (!email.trim() || !password.trim()) {
      toast.error("Email and password are required.");
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not sign in.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <main className="relative grid min-h-screen overflow-hidden bg-[#020b12] text-slate-100 lg:grid-cols-[0.43fr_0.57fr]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,242,254,0.14),transparent_28%),radial-gradient(circle_at_85%_70%,rgba(48,209,88,0.12),transparent_30%)]" />
      <Suspense fallback={null}><ThreeParticleField className="opacity-35" density="low" /></Suspense>
      <section className="relative flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="echo-glass w-full max-w-md p-7">
          <Link to="/" className="mb-8 flex items-center gap-3">
            <span className="relative grid size-12 place-items-center rounded-[1.15rem] bg-gradient-to-br from-cyan-300 to-emerald-300 text-[#031017]"><span className="absolute inset-[-8px] rounded-[1.45rem] border border-cyan-300/30 animate-echo-radar" /><span className="logo-font text-xl">E</span></span>
            <span><b className="logo-font text-xl text-white">ECE Echo</b><span className="block text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-200">Feedback Command</span></span>
          </Link>
          <h1 className="display-title text-3xl text-white">Access Command Center</h1>
          <p className="mt-2 text-sm text-slate-400">Sign in with an admin account to view feedback analytics and exports.</p>
          <input value={email} onChange={(event) => setEmail(event.target.value)} className="echo-input mt-8 h-12 w-full px-4" placeholder="Executive Identifier" />
          <input value={password} onChange={(event) => setPassword(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void submit(); }} className="echo-input mt-3 h-12 w-full px-4" placeholder="Secure Passcode" type="password" />
          <div className="mt-4 flex justify-between text-sm text-slate-300"><label><input type="checkbox" className="mr-2 accent-cyan-300" />Remember Me</label><a className="text-cyan-200">Forgot Password?</a></div>
          <button onClick={() => void submit()} disabled={loading} className="mt-6 w-full rounded-2xl bg-cyan-300 py-3 font-extrabold text-[#031017] hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-70">{loading ? "Signing in..." : "Access Command Center"}</button>
          <div className="mt-8 rounded-3xl border border-cyan-300/15 bg-white/[0.04] p-4"><p className="font-bold text-white">Production access</p><p className="mt-2 text-sm leading-6 text-slate-400">Use Supabase Auth admin credentials in production. Local development can use the fallback only when Supabase env variables are not configured.</p></div>
          <p className="mt-6 text-sm text-slate-400">Need access? <Link to="/signup" className="font-bold text-cyan-200">Create an account</Link></p>
        </motion.div>
      </section>
      <section className="relative hidden items-center justify-center p-10 lg:flex">
        <div className="max-w-lg">
          <AnimatedEchoHero />
          <div className="mt-8 rounded-3xl border border-cyan-300/15 bg-white/[0.04] p-5">
            <p className="display-title text-2xl text-white">Zero-data launch mode</p>
            <p className="mt-2 text-slate-400">Dashboards remain empty until real ECE feedback is submitted.</p>
          </div>
        </div>
      </section>
    </main>
  );
}

export function SignupPage() {
  const signup = useFeedbackStore((state) => state.signup);
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Viewer");
  const submit = () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      toast.error("Name, email, and password are required.");
      return;
    }
    signup(name.trim(), email.trim(), password, role);
    navigate("/dashboard", { replace: true });
  };
  return (
    <main className="grid min-h-screen place-items-center bg-[#020b12] p-4 text-slate-100">
      <Card className="w-full max-w-3xl">
        <div className="flex items-center gap-3">
          <span className="relative grid size-12 place-items-center rounded-[1.15rem] bg-gradient-to-br from-cyan-300 to-emerald-300 text-[#031017]"><span className="absolute inset-[-8px] rounded-[1.45rem] border border-cyan-300/30 animate-echo-radar" /><span className="logo-font text-xl">E</span></span>
          <div><h1 className="display-title text-3xl text-white">Create ECE Echo Access</h1><p className="text-sm text-slate-400">Signup logs you into the demo command center.</p></div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <input value={name} onChange={(event) => setName(event.target.value)} className="echo-input h-12 px-4" placeholder="Full Name" />
          <input className="echo-input h-12 px-4" placeholder="Employee ID" />
          <input value={email} onChange={(event) => setEmail(event.target.value)} className="echo-input h-12 px-4" placeholder="Corporate Email" />
          <input value={password} onChange={(event) => setPassword(event.target.value)} className="echo-input h-12 px-4" placeholder="Password" type="password" />
          <input className="echo-input h-12 px-4" placeholder="Confirm Password" type="password" />
          <CustomSelect label="Role" value={role} onChange={setRole} options={["Admin", "IT", "HR", "Facilities", "Security", "Manager", "Viewer"]} />
          <CustomSelect label="Site" value="Noel" onChange={() => undefined} options={["Noel", "Macias", "Consuelo"]} />
          <CustomSelect label="Account" value={Object.values(siteAccounts).flat()[0]} onChange={() => undefined} options={Object.values(siteAccounts).flat().slice(0, 12)} />
        </div>
        <button onClick={submit} className="mt-6 inline-flex rounded-2xl bg-cyan-300 px-6 py-3 font-extrabold text-[#031017] hover:bg-emerald-300">Create account</button>
        <p className="mt-5 text-sm text-slate-400">Already cleared? <Link to="/login" className="text-cyan-200">Authenticate here</Link></p>
      </Card>
    </main>
  );
}

function DashboardEmptyChart({ title, message = "Data will appear once real feedback is submitted" }: { title: string; message?: string }) {
  return (
    <div className="relative min-h-[260px] overflow-hidden rounded-[1.35rem] border border-cyan-300/10 bg-[#06131c] p-5">
      <div className="absolute inset-5 opacity-25" style={{ backgroundImage: "linear-gradient(rgba(0,242,254,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(0,242,254,0.12) 1px, transparent 1px)", backgroundSize: "36px 36px" }} />
      <div className="relative grid min-h-[220px] place-items-center text-center">
        <div>
          <Radio className="mx-auto mb-3 size-9 text-cyan-200 animate-echo-breathe" />
          <p className="font-extrabold text-white">{title}</p>
          <p className="mt-1 text-sm text-slate-500">{message}</p>
        </div>
      </div>
    </div>
  );
}

export function OverviewDashboard() {
  const feedback = useFeedbackStore((state) => state.feedback);
  const locations = useFeedbackStore((state) => state.locations);
  const alerts = useFeedbackStore((state) => state.alerts);
  const tickets = useFeedbackStore((state) => state.tickets);
  const sites = useFeedbackStore((state) => state.sites);
  const reports = useFeedbackStore((state) => state.reports);
  const today = recordsForToday(feedback);
  const hi = calculateHappinessIndex(feedback, feedback.filter((item) => isAfter(parseISO(item.submittedAt), subDays(new Date(), 60))));
  const dist = distribution(feedback);
  const hasData = feedback.length > 0;
  const safePct = (count: number) => (feedback.length ? `${Math.round((count / feedback.length) * 1000) / 10}%` : "0%");
  const openAlerts = alerts.filter((alert) => !["resolved", "dismissed"].includes(alert.status)).length;
  const openCases = tickets.filter((ticket) => !["resolved", "closed"].includes(ticket.status)).length;
  const urgentFeedback = feedback.filter((item) => item.priority === "High" || item.priority === "Critical").length;
  const averageRating = feedback.length ? Math.round((feedback.reduce((sum, item) => sum + item.rating, 0) / feedback.length) * 10) / 10 : 0;
  return (
    <motion.main initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_20%_0%,rgba(0,242,254,0.1),transparent_30%),linear-gradient(180deg,#07131c,#030b12)] p-4 md:p-6">
      <Suspense fallback={null}><ThreeParticleField className="opacity-25" density="low" /></Suspense>
      <div className="mb-6 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <p className="inline-flex rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.22em] text-cyan-100">ECE Echo Feedback Command</p>
          <h1 className="display-title mt-3 text-3xl text-white md:text-4xl">Executive Dashboard</h1>
          <p className="mt-2 max-w-3xl text-slate-400">Real-time feedback insights based only on submitted ECE feedback. No demo metrics are loaded automatically.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-xs font-extrabold text-emerald-200"><span className="size-2 rounded-full bg-emerald-300 animate-live-dot" />LIVE</span>
          <span className="rounded-full border border-cyan-300/15 bg-white/[0.04] px-3 py-2 text-xs font-bold text-slate-300">Last updated {format(new Date(), "HH:mm:ss")}</span>
        </div>
      </div>

      <div className="echo-glass mb-6 grid gap-3 p-4 md:grid-cols-5">
        {[
          ["All Sites", ["All Sites", "Noel", "Macias", "Consuelo"]],
          ["All Accounts", ["All Accounts", ...Object.values(siteAccounts).flat()]],
          ["All Categories", ["All Categories", ...Object.keys(feedbackCategories)]],
          ["All Statuses", ["All Statuses", "New", "Reviewed", "In Progress", "Resolved"]],
          ["Last 30 days", ["Last 30 days", "Today", "This week", "Last 90 days"]],
        ].map(([value, options]) => <CustomSelect key={String(value)} value={String(value)} onChange={() => undefined} options={options as string[]} />)}
      </div>

      {!hasData ? (
        <div className="echo-glass mb-6 grid gap-5 p-6 lg:grid-cols-[0.35fr_0.65fr]">
          <div className="grid place-items-center rounded-[1.6rem] border border-cyan-300/10 bg-[#06131c] p-8 text-center">
            <Radio className="mb-4 size-12 text-cyan-200 animate-echo-breathe" />
            <h2 className="display-title text-2xl text-white">Waiting for first feedback</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">Dashboard metrics will update automatically once employees, visitors, applicants, or clients submit feedback.</p>
            <Link to="/submit-feedback" className="mt-6 rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-extrabold text-[#031017] hover:bg-emerald-300">Submit First Feedback</Link>
          </div>
          <DashboardEmptyChart title="No feedback submitted yet" />
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Card className="xl:col-span-2"><HappinessScore index={hi} /><div className="mt-5"><HappinessBar index={hi} /></div></Card>
        {dist.map((item, index) => <KPICard key={item.name} label={item.name} value={item.value} helper={`${safePct(item.value)} of responses`} tone={index < 2 ? "green" : index === 2 ? "amber" : "red"} delay={index * 0.04} />)}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <KPICard label="Total Feedback" value={feedback.length} helper="All submitted records" />
        <KPICard label="Submitted Today" value={today.length} helper="From local records" />
        <KPICard label="Open Alerts" value={openAlerts} helper="Generated by real feedback" tone="red" />
        <KPICard label="Open Cases" value={openCases} helper="Actionable feedback" tone="amber" />
        <KPICard label="Reports Generated" value={reports.length} helper="Manual exports only" tone="blue" />
        <KPICard label="Average Rating" value={averageRating} helper={`${urgentFeedback} urgent feedback`} />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3 xl:grid-cols-5">
        {sites.map((site) => { const summary = siteSummary(feedback, site.name); return <Card key={site.id}><p className="font-bold text-slate-200">{site.name}</p><p className="mt-2 display-title text-3xl" style={{ color: summary.color }}>{summary.score}</p><p className="mt-1 text-sm text-slate-500">{summary.totalResponses} responses</p></Card>; })}
        <Card><p className="font-bold text-slate-200">Active Accounts</p><p className="mt-2 display-title text-3xl text-cyan-100">{configuredAccountCount}</p><p className="mt-1 text-sm text-slate-500">Configured only</p></Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card><h2 className="text-xl font-extrabold text-white">Satisfaction Trend</h2>{hasData ? <HappinessIndexChart feedback={feedback} /> : <DashboardEmptyChart title="No trend data yet" />}</Card>
        <Card><h2 className="text-xl font-extrabold text-white">Hourly Response Volume</h2>{hasData ? <ResponseVolumeChart feedback={feedback} /> : <DashboardEmptyChart title="No hourly volume yet" />}</Card>
        <Card><h2 className="text-xl font-extrabold text-white">Site / Touchpoint Ranking</h2>{hasData ? <LocationComparisonChart feedback={feedback} locations={locations} /> : <DashboardEmptyChart title="No ranking data yet" />}</Card>
        <Card><h2 className="text-xl font-extrabold text-white">Rating Distribution</h2>{hasData ? <SmileyDistributionChart feedback={feedback} /> : <DashboardEmptyChart title="No distribution yet" />}</Card>
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2"><LiveFeedPanel feedback={feedback} /><SummaryPanel alerts={alerts} tickets={tickets} /></div>
    </motion.main>
  );
}

function LiveFeedPanel({ feedback }: { feedback: FeedbackResponse[] }) {
  return <Card><div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-extrabold text-white">Latest Feedback</h2><span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-bold text-emerald-200">● LIVE</span></div>{feedback.length ? <div className="max-h-96 space-y-2 overflow-y-auto">{feedback.slice(0, 12).map((item) => <motion.div key={item.id} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-between rounded-2xl border border-cyan-300/10 bg-white/[0.04] p-3"><div className="flex items-center gap-3"><SmileyBadge rating={item.rating} /><div><p className="font-semibold text-slate-100">{item.locationName}</p><p className="text-xs text-slate-500">{item.siteName} · {item.category}</p></div></div><span className="text-xs text-slate-500">{formatShortDate(item.submittedAt)}</span></motion.div>)}</div> : <DashboardEmptyChart title="No feedback records yet" message="Most recent feedback will appear here after submission." />}</Card>;
}

function SummaryPanel({ alerts, tickets }: { alerts: ReturnType<typeof useFeedbackStore.getState>["alerts"]; tickets: ReturnType<typeof useFeedbackStore.getState>["tickets"] }) {
  return <div className="grid gap-6 md:grid-cols-2"><Card><h2 className="text-xl font-extrabold text-white">Active Alerts</h2><div className="mt-4 space-y-3">{alerts.length ? alerts.slice(0, 5).map((alert) => <div key={alert.id} className="rounded-2xl border-l-4 border-red-400 bg-red-400/10 p-3"><StatusBadge value={alert.priority} /><p className="mt-2 font-semibold text-slate-100">{alert.title}</p><p className="text-xs text-slate-500">{alert.locationName}</p></div>) : <DashboardEmptyChart title="No alerts recorded" message="Alerts are created only by negative or urgent feedback." />}</div></Card><Card><h2 className="text-xl font-extrabold text-white">Open Cases</h2><div className="mt-4 space-y-3">{tickets.length ? tickets.slice(0, 5).map((ticket) => <div key={ticket.id} className="rounded-2xl border border-cyan-300/10 bg-white/[0.04] p-3"><p className="text-xs text-slate-500">{ticket.id}</p><p className="font-semibold text-slate-100">{ticket.title}</p><p className="text-xs text-slate-500">SLA {minutesUntil(ticket.slaDeadline)}m</p></div>) : <DashboardEmptyChart title="No cases assigned yet" message="Actionable feedback will create a case automatically." />}</div></Card></div>;
}

export function AnalyticsOverview() {
  const feedback = useFeedbackStore((state) => state.feedback);
  const locations = useFeedbackStore((state) => state.locations);
  const insights = useFeedbackStore((state) => state.insights);
  return <Page title="Analytics Overview" subtitle="Satisfaction trends, category ranking, site comparison, sentiment distribution, and AI recommendations."><FilterBar /><div className="grid gap-6"><Card><h2 className="font-display text-xl font-bold">Satisfaction Trend</h2><HappinessIndexChart feedback={feedback} height={320} /></Card><div className="grid gap-6 xl:grid-cols-2"><Card><h2 className="font-display text-xl font-bold">Location Comparison</h2><LocationComparisonChart feedback={feedback} locations={locations} /></Card><Card><h2 className="font-display text-xl font-bold">Sentiment Distribution</h2><SmileyDistributionChart feedback={feedback} /></Card></div><Card><h2 className="font-display text-xl font-bold">Hourly Heatmap</h2><div className="mt-4"><HourlyHeatmapChart feedback={feedback} /></div></Card><div className="grid gap-4 md:grid-cols-4">{insights.map((insight) => <Card key={insight.id}><StatusBadge value={insight.impact} /><h3 className="mt-4 font-display text-lg font-bold">{insight.title}</h3><p className="mt-2 text-sm text-slate-500">{insight.description}</p><p className="mt-3 text-xs font-semibold text-brand-green">{insight.confidence}% confidence</p></Card>)}</div></div></Page>;
}

export function KioskPage() {
  const { locationId } = useParams();
  const locations = useFeedbackStore((state) => state.locations);
  const addFeedback = useFeedbackStore((state) => state.addFeedback);
  const location = locations.find((item) => item.id === locationId) ?? locations[0];
  return <KioskTerminal location={location} onSubmit={(rating, followUps, comment) => addFeedback(createFeedback(location, rating, followUps, comment))} />;
}

export function KioskGridPage() {
  const locations = useFeedbackStore((state) => state.locations);
  return <Page title="Kiosk Launch Grid" subtitle="Open fullscreen smiley terminals for any ECE touchpoint."><div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">{locations.slice(0, 24).map((location) => <Card key={location.id}><p className="text-lg font-extrabold text-white">{location.name}</p><p className="mt-1 text-sm text-slate-500">{location.siteName} · {location.floor}</p><Link to={`/kiosk/${location.id}`} className="mt-5 inline-flex rounded-full bg-cyan-300 px-4 py-2 text-sm font-bold text-[#031017] hover:bg-emerald-300">Open Kiosk</Link></Card>)}</div></Page>;
}

export function QRFeedbackPage() {
  const { locationId } = useParams();
  const locations = useFeedbackStore((state) => state.locations);
  const addFeedback = useFeedbackStore((state) => state.addFeedback);
  const location = locations.find((item) => item.id === locationId) ?? locations[0];
  return <QRLandingPage location={location} onSubmit={(rating, followUps, comment) => addFeedback(createFeedback(location, rating, followUps, comment))} />;
}

export function QRGridPage() {
  const locations = useFeedbackStore((state) => state.locations);
  return <Page title="QR Feedback" subtitle="Mobile feedback landing pages by location."><div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">{locations.slice(0, 24).map((location) => <Card key={location.id}><QrCode className="size-10 text-cyan-200" /><p className="mt-4 text-lg font-extrabold text-white">{location.name}</p><p className="text-sm text-slate-500">{location.qrCode}</p><Link to={`/qr/${location.id}`} className="mt-5 inline-flex rounded-full border border-cyan-300/30 bg-white/5 px-4 py-2 text-sm font-bold text-cyan-100 hover:bg-cyan-300/10">Preview QR</Link></Card>)}</div></Page>;
}

export function LocationsPage() {
  const feedback = useFeedbackStore((state) => state.feedback);
  const locations = useFeedbackStore((state) => state.locations);
  const [siteFilter, setSiteFilter] = useState("All Sites");
  const [scopeFilter, setScopeFilter] = useState("All Scopes");
  const [accountFilter, setAccountFilter] = useState("All Accounts");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [floorFilter, setFloorFilter] = useState("All Floors");
  const filtered = locations.filter((location) => {
    if (siteFilter !== "All Sites" && location.siteName !== siteFilter) return false;
    if (scopeFilter !== "All Scopes" && location.scope !== scopeFilter) return false;
    if (accountFilter !== "All Accounts" && location.account !== accountFilter) return false;
    if (categoryFilter !== "All Categories" && location.categoryGroup !== categoryFilter && location.category !== categoryFilter) return false;
    if (floorFilter !== "All Floors" && location.floor !== floorFilter) return false;
    return true;
  });
  const floors = Array.from(new Set(locations.map((location) => location.floor))).filter(Boolean);
  const categories = Array.from(new Set(locations.map((location) => location.categoryGroup ?? location.category))).filter(Boolean);
  const accounts = Array.from(new Set(locations.map((location) => location.account).filter(Boolean))) as string[];
  const sections: Array<[string, Location[]]> = [
    ["Site-Wide Shared Areas", filtered.filter((location) => location.scope === "site-wide" || location.scope === "department-service")],
    ["Floor-Shared Areas", filtered.filter((location) => location.scope === "floor-shared")],
    ["Account Production Areas", filtered.filter((location) => location.scope === "account-specific")],
  ];
  return (
    <Page title="Locations" subtitle="Correct site-wide, floor-shared, department-service, and account-specific ECE touchpoints.">
      <div className="echo-glass mb-6 grid gap-3 p-4 md:grid-cols-3 xl:grid-cols-5">
        <CustomSelect value={siteFilter} onChange={setSiteFilter} options={["All Sites", "Noel", "Macias", "Consuelo"]} />
        <CustomSelect value={scopeFilter} onChange={(value) => setScopeFilter(value as LocationScope | "All Scopes")} options={[
          { value: "All Scopes", label: "All Scopes" },
          { value: "site-wide", label: "Site-wide" },
          { value: "floor-shared", label: "Floor-shared" },
          { value: "account-specific", label: "Account-specific" },
          { value: "department-service", label: "Department-service" },
        ]} />
        <CustomSelect value={accountFilter} onChange={setAccountFilter} options={["All Accounts", ...accounts]} />
        <CustomSelect value={categoryFilter} onChange={setCategoryFilter} options={["All Categories", ...categories]} />
        <CustomSelect value={floorFilter} onChange={setFloorFilter} options={["All Floors", ...floors]} />
      </div>
      <div className="space-y-8">
        {sections.map(([title, rows]) => rows.length ? (
          <section key={title}>
            <h2 className="mb-4 text-xl font-extrabold text-white">{title}</h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {rows.map((location) => <LocationCard key={location.id} location={location} feedback={feedback} />)}
            </div>
          </section>
        ) : null)}
      </div>
    </Page>
  );
}

function LocationCard({ location, feedback }: { location: Location; feedback: FeedbackResponse[] }) {
  const rows = feedback.filter((item) => item.locationId === location.id);
  const hi = calculateHappinessIndex(rows);
  const hasData = rows.length > 0;
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <MapPin className="size-6 text-emerald-300" />
        <StatusBadge value={location.isActive ? "active" : "inactive"} />
      </div>
      <h3 className="mt-5 text-lg font-extrabold text-white">{location.name}</h3>
      <p className="mt-1 text-sm text-slate-500">{location.siteName} · {location.scope?.replace("-", " ")}{location.account ? ` · ${location.account}` : ""}{location.floor ? ` · ${location.floor}` : ""}</p>
      <p className="mt-4 min-h-12 text-sm leading-6 text-slate-400">{location.description}</p>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-[#06131c] p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Feedback</p>
          <p className="display-title mt-2 text-2xl text-white">{rows.length}</p>
        </div>
        <div className="rounded-2xl bg-[#06131c] p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Score</p>
          <p className="display-title mt-2 text-2xl" style={{ color: hi.color }}>{hi.score}</p>
        </div>
      </div>
      <div className="mt-4">
        {hasData ? <TrendSparkline data={rows.slice(0, 8).map((item) => ({ value: Math.round((item.rating / 5) * 100) }))} /> : <div className="grid h-12 place-items-center rounded-2xl border border-dashed border-cyan-300/15 text-xs font-semibold text-slate-500">No feedback yet</div>}
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link to="/submit-feedback" className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-bold text-[#031017] shadow-[0_0_20px_rgba(0,242,254,0.22)] transition hover:scale-105 hover:bg-emerald-300">Submit Feedback</Link>
        <Link to={`/locations/${location.id}`} className="rounded-full border border-cyan-300/30 bg-white/5 px-4 py-2 text-sm font-bold text-cyan-100 hover:bg-cyan-300/10">View Details</Link>
      </div>
    </Card>
  );
}

export function LocationDetail() {
  const { id } = useParams();
  const feedback = useFeedbackStore((state) => state.feedback);
  const locations = useFeedbackStore((state) => state.locations);
  const location = locations.find((item) => item.id === id) ?? locations[0];
  const rows = feedback.filter((item) => item.locationId === location.id);
  const hi = calculateHappinessIndex(rows);
  return <Page title={location.name} subtitle={`${location.siteName} · ${location.floor} · ${location.category}`}><div className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]"><Card><HappinessScore index={hi} /><div className="mt-5"><HappinessBar index={hi} /></div></Card><Card><h2 className="font-display text-xl font-bold">7-day Trend</h2><HappinessIndexChart feedback={rows} /></Card></div><div className="mt-6"><DataTable headers={["Smiley", "Category", "Comment", "Time"]} rows={rows.slice(0, 12).map((item) => [<SmileyBadge rating={item.rating} />, item.category, item.comment ?? "No comment", timeAgo(item.submittedAt)])} /></div></Page>;
}

export function FeedbackInbox() {
  const feedback = useFeedbackStore((state) => state.feedback);
  return <Page title="Feedback Inbox" subtitle="All feedback records with live updates."><FilterBar /><DataTable headers={["Smiley", "Submitter", "Site / Account", "Category", "Rating", "Time"]} rows={feedback.slice(0, 80).map((item) => [<SmileyBadge rating={item.rating} />, item.isAnonymous ? "Anonymous" : item.respondentType, `${item.siteName} · ${item.floor}`, item.category, item.rating, formatShortDate(item.submittedAt)])} /></Page>;
}

export function FeedbackDetail() {
  const { id } = useParams();
  const feedback = useFeedbackStore((state) => state.feedback);
  const item = feedback.find((row) => row.id === id) ?? feedback[0];
  if (!item) return <Page title="Case Management" subtitle="No cases assigned yet."><DashboardEmptyChart title="No feedback case found" message="Submit feedback to create a case record." /></Page>;
  return <Page title={item.id} subtitle={`${item.locationName} · ${item.category}`}><Card><div className="grid gap-4 md:grid-cols-4"><SmileyBadge rating={item.rating} /><p><b>Respondent:</b> {item.respondentType}</p><p><b>Device:</b> {item.deviceId}</p><p><b>Submitted:</b> {formatShortDate(item.submittedAt)}</p></div><p className="mt-6 rounded-2xl bg-white/[0.04] p-4 text-slate-300">{item.comment ?? "No written comment."}</p></Card></Page>;
}

export function AlertCenter() {
  const alerts = useFeedbackStore((state) => state.alerts);
  const update = useFeedbackStore((state) => state.updateAlertStatus);
  return <Page title="Alerts Center" subtitle="Critical dissatisfaction, HI threshold drops, device issues, and SLA warnings."><div className="mb-6 grid gap-4 md:grid-cols-4"><KPICard label="Critical" value={alerts.filter((a) => a.priority === "critical").length} tone="red" /><KPICard label="High" value={alerts.filter((a) => a.priority === "high").length} tone="amber" /><KPICard label="Medium" value={alerts.filter((a) => a.priority === "medium").length} tone="blue" /><KPICard label="Resolved 24h" value={alerts.filter((a) => a.status === "resolved").length} /></div><div className="grid gap-4">{alerts.map((alert) => <Card key={alert.id} className="border-l-4 border-l-red-500"><div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><StatusBadge value={alert.priority} /><h3 className="mt-3 font-display text-lg font-bold">{alert.title}</h3><p className="text-slate-500">{alert.description}</p></div><div className="flex gap-2">{["acknowledged", "in-progress", "resolved"].map((status) => <button key={status} onClick={() => update(alert.id, status as typeof alert.status)} className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold">{status}</button>)}</div></div></Card>)}</div></Page>;
}

export function TicketingPage() {
  const tickets = useFeedbackStore((state) => state.tickets);
  const update = useFeedbackStore((state) => state.updateTicketStatus);
  const columns = ["new", "assigned", "in-progress", "on-hold", "resolved", "closed", "escalated"] as const;
  return <Page title="Ticketing System" subtitle="Feedback → AI categorize → ticket → SLA timer → resolved → verified."><div className="mb-6 rounded-2xl bg-white p-5 shadow-card"><div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-600">{["Feedback", "AI Categorize", "Ticket Created", "Assigned", "SLA Timer", "Resolved", "Verified"].map((step, index) => <span key={step} className="inline-flex items-center gap-2"><span className="grid size-7 place-items-center rounded-full bg-green-50 text-brand-green">{index + 1}</span>{step}</span>)}</div></div><div className="grid gap-4 xl:grid-cols-7">{columns.map((column) => <div key={column} className="rounded-2xl bg-slate-100 p-3"><h3 className="mb-3 font-bold capitalize">{column.replace("-", " ")}</h3>{tickets.filter((ticket) => ticket.status === column).slice(0, 5).map((ticket) => <div key={ticket.id} className="mb-3 rounded-xl bg-white p-3 shadow-sm"><p className="font-mono text-xs text-slate-400">{ticket.id}</p><p className="font-semibold">{ticket.title}</p><StatusBadge value={ticket.priority} /><button onClick={() => update(ticket.id, "in-progress")} className="mt-3 block text-xs font-bold text-brand-green">Move</button></div>)}</div>)}</div></Page>;
}

export function ReportsCenter() {
  const reports = useFeedbackStore((state) => state.reports);
  const addReport = useFeedbackStore((state) => state.addReport);
  const { exportFile } = useExport();
  const generate = (format: "PDF" | "Excel" | "PowerPoint") => { addReport(`Generated ${format} Report`, "executive"); exportFile(format, "Executive report"); };
  return <Page title="Reports Center" subtitle="Daily, weekly, monthly, executive, and department reporting."><div className="grid gap-6 xl:grid-cols-[0.42fr_0.58fr]"><Card><h2 className="text-xl font-extrabold text-white">Configuration Wizard</h2><div className="mt-5 space-y-3"><CustomSelect value="Executive" onChange={() => undefined} options={["Executive", "Daily", "Weekly", "IT", "Facilities"]} /><input className="echo-input h-11 w-full px-3" defaultValue="ECE Echo Executive Report" /><div className="grid gap-3 md:grid-cols-3">{["PDF", "Excel", "PowerPoint"].map((format) => <button key={format} onClick={() => generate(format as "PDF" | "Excel" | "PowerPoint")} className="rounded-xl bg-cyan-300 px-4 py-3 font-bold text-[#031017]"><Download className="mx-auto mb-2 size-4" />{format}</button>)}</div></div></Card><Card><h2 className="text-xl font-extrabold text-white">Archive Ledger</h2><DataTable headers={["Report", "Type", "Generated", "Status"]} rows={reports.map((report) => [report.title, report.type, formatShortDate(report.generatedAt), <StatusBadge value={report.status} />])} /></Card></div></Page>;
}

export function DeviceMonitoring() {
  const devices = useFeedbackStore((state) => state.devices);
  return <Page title="Device Monitoring" subtitle="Kiosk health, battery, connectivity, and floor map view."><div className="mb-6 grid gap-4 md:grid-cols-5"><KPICard label="Total" value={devices.length} /><KPICard label="Online" value={devices.filter((d) => d.status === "online").length} /><KPICard label="Offline" value={devices.filter((d) => d.status === "offline").length} tone="red" /><KPICard label="Warning" value={devices.filter((d) => d.status === "warning").length} tone="amber" /><KPICard label="Avg Battery" value={`${Math.round(devices.reduce((s, d) => s + d.batteryLevel, 0) / devices.length)}%`} /></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{devices.slice(0, 24).map((device) => <Card key={device.id}><div className="flex items-center justify-between"><p className="font-mono font-bold">{device.id}</p><StatusBadge value={device.status} /></div><p className="mt-3 font-semibold">{device.locationName}</p><p className="text-sm text-slate-500">🔋 {device.batteryLevel}% · 📶 {device.signalStrength}%</p><p className="mt-2 text-xs text-slate-400">Last sync: {timeAgo(device.lastSyncAt)}</p></Card>)}</div></Page>;
}

export function SmartTVWallboard() {
  const feedback = useFeedbackStore((state) => state.feedback);
  const sites = useFeedbackStore((state) => state.sites);
  const hi = calculateHappinessIndex(feedback);
  return <main className="relative min-h-screen overflow-hidden bg-[#020b12] p-10 text-white"><Suspense fallback={null}><ThreeParticleField className="opacity-35" /></Suspense><div className="relative"><div className="flex items-center justify-between"><h1 className="wallboard-title text-6xl">ECE ECHO</h1><span className="rounded-full bg-green-500/20 px-5 py-2 font-bold text-green-300">● LIVE</span></div><p className="mt-3 text-xl text-slate-400">{format(new Date(), "EEEE, MMMM d, yyyy HH:mm:ss")}</p><div className="mt-10 grid gap-8 lg:grid-cols-[0.4fr_0.6fr]"><Card className="bg-white/10 text-white backdrop-blur"><p className="text-slate-300">Overall Happiness</p><p className="wallboard-title text-[8rem] leading-none" style={{ color: hi.color }}>{hi.score}</p></Card><div className="grid gap-4 md:grid-cols-3">{sites.map((site) => { const score = siteSummary(feedback, site.name); return <div key={site.id} className="rounded-3xl border border-cyan-300/15 bg-white/10 p-5"><p className="font-bold">{site.name}</p><p className="mt-4 wallboard-title text-5xl" style={{ color: score.color }}>{score.score}</p></div>; })}</div></div><div className="mt-10 rounded-3xl bg-white/10 p-6"><HourlyHeatmapChart feedback={feedback} /></div></div></main>;
}

export function RealTimeFeed() { const feedback = useFeedbackStore((s) => s.feedback); return <Page title="Real-Time Feed" subtitle="Live scrolling stream of every response."><LiveFeedPanel feedback={feedback} /></Page>; }
export function HourlyAnalytics() { const feedback = useFeedbackStore((s) => s.feedback); return <Page title="Hourly Analytics"><Card><HourlyHeatmapChart feedback={feedback} /></Card></Page>; }
export function LocationAnalytics() { const feedback = useFeedbackStore((s) => s.feedback); const locations = useFeedbackStore((s) => s.locations); return <Page title="Location Analytics"><Card><LocationComparisonChart feedback={feedback} locations={locations} /></Card></Page>; }
export function CategoryAnalytics() { const feedback = useFeedbackStore((s) => s.feedback); return <Page title="Category Analytics"><Card><ResponseVolumeChart feedback={feedback} /></Card></Page>; }
export function TrendAnalysis() { const feedback = useFeedbackStore((s) => s.feedback); return <Page title="Trend Analysis"><Card><WeeklyComparisonChart feedback={feedback} /></Card></Page>; }
export function FloorMapPage() { const devices = useFeedbackStore((s) => s.devices); return <Page title="Floor Heatmap"><div className="grid grid-cols-8 gap-3 rounded-3xl bg-white p-6 shadow-card">{devices.slice(0, 48).map((d) => <div key={d.id} className={`h-14 rounded-xl ${d.status === "online" ? "bg-green-200" : d.status === "warning" ? "bg-amber-200" : "bg-red-200"}`} title={d.locationName} />)}</div></Page>; }
export function SiteComparison() { const feedback = useFeedbackStore((s) => s.feedback); const sites = useFeedbackStore((s) => s.sites); return <Page title="Site Comparison"><div className="grid gap-4 md:grid-cols-5">{sites.map((site) => <Card key={site.id}><HappinessScore compact index={siteSummary(feedback, site.name)} /></Card>)}</div></Page>; }
export function ResponseTrends() { const feedback = useFeedbackStore((s) => s.feedback); return <Page title="Response Trends"><Card><HappinessIndexChart feedback={feedback} /></Card></Page>; }
export function AlertSettings() { return <Page title="Alert Settings"><Card><h2 className="font-display text-xl font-bold">Thresholds</h2><label className="mt-5 block text-sm font-semibold">HI below<input type="range" min="0" max="100" defaultValue="60" className="mt-3 w-full accent-brand-green" /></label></Card></Page>; }
export function TicketDetail() { const { id } = useParams(); const tickets = useFeedbackStore((s) => s.tickets); const ticket = tickets.find((t) => t.id === id) ?? tickets[0]; if (!ticket) return <Page title="Ticket Detail"><DashboardEmptyChart title="No cases assigned yet" /></Page>; return <Page title={ticket.id} subtitle={ticket.title}><Card><StatusBadge value={ticket.priority} /><p className="mt-4">{ticket.description}</p><p className="mt-4 text-sm text-slate-500">SLA deadline: {formatShortDate(ticket.slaDeadline)}</p></Card></Page>; }
export function DeviceDetail() { const { id } = useParams(); const devices = useFeedbackStore((s) => s.devices); const d = devices.find((x) => x.id === id) ?? devices[0]; return <Page title={d.id} subtitle={d.locationName}><Card><StatusBadge value={d.status} /><div className="mt-6 grid gap-4 md:grid-cols-4"><KPICard label="Battery" value={`${d.batteryLevel}%`} /><KPICard label="Signal" value={`${d.signalStrength}%`} /><KPICard label="Touchscreen" value={`${d.touchscreenHealth}%`} /><KPICard label="Uptime" value={`${d.uptime}h`} /></div></Card></Page>; }
export function ReportViewer() { const reports = useFeedbackStore((s) => s.reports); const feedback = useFeedbackStore((s) => s.feedback); if (!reports.length) return <Page title="Report Viewer"><DashboardEmptyChart title="No reports generated yet" /></Page>; return <Page title="Report Viewer"><Card><h2 className="text-xl font-extrabold text-white">{reports[0].title}</h2><HappinessIndexChart feedback={feedback} /></Card></Page>; }

export function DepartmentPage({ title, category, icon: Icon = Building2 }: { title: string; category: string; icon?: IconComponent }) {
  const feedback = useFeedbackStore((s) => s.feedback);
  const rows = feedback.filter((item) => item.category === category || item.subcategory?.includes(category));
  const scoped = rows;
  return <Page title={title} subtitle={`${category} KPI cards, charts, feedback table, filters, and export controls.`} actions={<button onClick={() => toast.success("Export simulated")} className="rounded-xl bg-cyan-300 px-4 py-2 font-bold text-[#031017]">Export</button>}><FilterBar /><div className="grid gap-4 md:grid-cols-4"><KPICard label="Responses" value={scoped.length} /><KPICard label="HI Score" value={calculateHappinessIndex(scoped).score} /><KPICard label="Open Issues" value={scoped.filter((i) => i.rating <= 2).length} tone="red" /><KPICard label="Resolved" value={scoped.filter((i) => i.status === "Resolved" || i.status === "Closed").length} /></div><div className="mt-6 grid gap-6 xl:grid-cols-2"><Card><Icon className="mb-4 size-7 text-cyan-200" /><HappinessIndexChart feedback={scoped} /></Card><Card><SmileyDistributionChart feedback={scoped} /></Card></div><div className="mt-6"><DataTable headers={["Rating", "Location", "Comment", "Time"]} rows={scoped.slice(0, 20).map((item) => [<SmileyBadge rating={item.rating} />, item.locationName, item.comment ?? "No comment", formatShortDate(item.submittedAt)])} /></div></Page>;
}

export function EmployeePulsePage() { return <DepartmentPage title="Employee Satisfaction Pulse" category="Operations" icon={Users} />; }
export function ITFeedbackPage() { return <DepartmentPage title="IT Helpdesk Feedback" category="IT" icon={Monitor} />; }
export function FacilitiesPage() { return <DepartmentPage title="Facilities Management" category="Facilities" icon={Building2} />; }
export function HRSatisfactionPage() { return <DepartmentPage title="HR Satisfaction" category="HR" icon={Users} />; }
export function RecruitmentPage() { return <DepartmentPage title="Recruitment Experience" category="Recruitment" icon={ClipboardIcon} />; }
function ClipboardIcon(props: ComponentProps<typeof FileText>) { return <FileText {...props} />; }
export function VisitorWelcomePage() { return <DepartmentPage title="Visitor Welcome" category="Visitor" icon={Smile} />; }
export function TrainingFeedbackPage() { return <DepartmentPage title="Training Feedback" category="Training" icon={FileText} />; }
export function STLDashboard() { return <DepartmentPage title="STL Dashboard" category="Operations" icon={HomeIcon} />; }
function HomeIcon(props: ComponentProps<typeof Building2>) { return <Building2 {...props} />; }

export function AdminPanel() {
  const users = useFeedbackStore((s) => s.users);
  const locations = useFeedbackStore((s) => s.locations);
  const devices = useFeedbackStore((s) => s.devices);
  const loadDemoData = useFeedbackStore((s) => s.loadDemoData);
  return <Page title="Admin Panel" subtitle="Users, locations, devices, surveys, notifications, branding, API, and audit logs." actions={<button onClick={loadDemoData} className="rounded-2xl border border-amber-300/25 bg-amber-300/10 px-4 py-2 text-sm font-extrabold text-amber-100">Load Demo Data</button>}><div className="grid gap-6"><Card><h2 className="text-xl font-extrabold text-white">Demo data is for testing only</h2><p className="mt-2 text-sm text-slate-400">Dashboard metrics stay at zero until feedback is submitted or an admin manually loads demo data.</p></Card><Card><h2 className="text-xl font-extrabold text-white">Users</h2><div className="mt-4"><UserTable users={users.slice(0, 8)} /></div></Card><Card><h2 className="text-xl font-extrabold text-white">Locations</h2><div className="mt-4"><LocationManager locations={locations} /></div></Card><Card><h2 className="text-xl font-extrabold text-white">Devices</h2><div className="mt-4"><DeviceManager devices={devices} /></div></Card><SurveyBuilder /></div></Page>;
}

export function UserManagement() { const users = useFeedbackStore((s) => s.users); return <Page title="User Management"><UserTable users={users} /></Page>; }
export function RoleAccess() { return <Page title="Role Access"><RolePermissions /></Page>; }
export function SurveyManagement() { return <Page title="Survey Management"><SurveyBuilder /></Page>; }
export function NotificationSettings() { return <Page title="Notification Settings"><Card><h2 className="font-display text-xl font-bold">Notification rules</h2>{["HI below 60", "3 consecutive very unhappy", "Device offline", "SLA breach"].map((rule) => <label key={rule} className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 p-4"><span>{rule}</span><input type="checkbox" className="accent-brand-green" defaultChecked /></label>)}</Card></Page>; }
export function AuditLogs() {
  const auditLogs = useFeedbackStore((s) => s.auditLogs);
  return <Page title="Audit Logs" subtitle="Authentication, submissions, case updates, exports, and admin actions."><DataTable headers={["Timestamp", "User", "Action", "Module", "Details"]} rows={auditLogs.map((log) => [formatShortDate(log.timestamp), log.user, log.action, log.module, log.details])} /></Page>;
}

export function WebFeedbackPage() {
  return <ProductionFeedbackForm />;
}

