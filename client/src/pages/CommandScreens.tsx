import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Download,
  Eye,
  LockKeyhole,
  Mail,
  Plus,
  Search,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  appRoles,
  feedbackCategoryGroups,
  priorities,
  ratingOptions,
  reportTypes,
  roleTypes,
  siteFloors,
  statuses,
} from "@/data/commandCenterData";
import {
  Field,
  FilterBar,
  GlassCard,
  KpiCard,
  Modal,
  PageFrame,
  PriorityBadge,
  SelectInput,
  SmileyRating,
  StatusBadge,
  TextInput,
  EmptyState,
} from "@/components/command/CommandComponents";
import { useToast } from "@/components/ui/ToastNotification";
import {
  getAccountsForSite,
  getSummary,
  groupCount,
  useCommandCenter,
  type AppRole,
  type Priority,
  type RatingLabel,
  type SiteName,
} from "@/store/commandCenterStore";

const chartColors = ["#00F2FE", "#30D158", "#FFD60A", "#FF9F0A", "#FF3B30", "#b9cacb", "#849495"];
const tooltip = { background: "#151d1e", border: "1px solid rgba(0,242,254,.25)", borderRadius: 14, color: "#dce4e4" };

function getTrend(feedback: ReturnType<typeof useCommandCenter.getState>["feedback"]) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days.map((day, index) => {
    const value = feedback.filter((item) => new Date(item.createdAt).getDay() === ((index + 1) % 7)).length;
    return { name: day, value };
  });
}

function getRatingDistribution(feedback: ReturnType<typeof useCommandCenter.getState>["feedback"]) {
  return ratingOptions.map((rating) => ({ name: rating.label, value: feedback.filter((item) => item.rating === rating.label).length }));
}

function getSiteData(feedback: ReturnType<typeof useCommandCenter.getState>["feedback"]) {
  return (["Noel", "Macias", "Consuelo"] as const).map((site) => ({ name: site, value: feedback.filter((item) => item.site === site).length }));
}

function getCategoryData(feedback: ReturnType<typeof useCommandCenter.getState>["feedback"]) {
  return feedbackCategoryGroups.map((category) => ({ name: category.dashboardLabel, value: feedback.filter((item) => item.category === category.group).length }));
}

function ChartOrEmpty({ hasData, children, title = "No feedback submitted yet" }: { hasData: boolean; children: ReactNode; title?: string }) {
  return hasData ? children : <EmptyState title={title} text="Waiting for first response." />;
}

function LandingHeroImage() {
  const cards = [
    ["😄", "Great support", "Thank you, team!", "md:-left-3 md:top-8"],
    ["🙂", "Quick pulse", "One tap feedback.", "md:-right-3 md:top-20"],
    ["😟", "Needs attention", "Routes to the right team.", "md:left-0 md:bottom-24"],
    ["◇", "Waiting for first response", "Dashboard starts from zero.", "md:right-0 md:bottom-8"],
  ];
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7 }}
      className="relative mx-auto w-full max-w-[620px]"
    >
      <div className="absolute inset-8 rounded-[42px] bg-cyan-300/20 blur-3xl" />
      <div className="relative overflow-hidden rounded-[36px] border border-cyan-300/25 bg-gradient-to-br from-cyan-200/12 to-emerald-200/8 p-3 shadow-[0_0_70px_rgba(0,251,251,.13)]">
        <div className="relative h-[380px] overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#dffcff,#c8f3ef)] sm:h-[460px] lg:h-[520px]">
          <div className="absolute inset-x-12 bottom-0 top-14 rounded-t-full bg-[#051424]/10 blur-3xl" />
          <img
            src="/images/hero-ece-staff.png"
            alt=""
            aria-hidden="true"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
            className="relative z-10 h-full w-full object-contain object-center"
          />
          <div className="pointer-events-none absolute inset-0 rounded-[28px] ring-1 ring-inset ring-white/40" />
        </div>
      </div>
      {cards.map(([emoji, title, text, position], index) => (
        <motion.div
          key={title}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: [0, -8, 0] }}
          transition={{ opacity: { delay: 0.25 + index * 0.12 }, y: { repeat: Infinity, duration: 4 + index * 0.25 } }}
          whileHover={{ y: -10, scale: 1.03 }}
          className={`static z-30 mt-3 rounded-[24px] border border-white/55 bg-white/90 p-4 text-slate-950 shadow-2xl backdrop-blur md:absolute md:mt-0 md:w-52 ${position}`}
        >
          <motion.span animate={{ scale: [1, 1.08, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="block text-3xl">{emoji}</motion.span>
          <p className="mt-2 text-sm font-black">{title}</p>
          <p className="text-xs text-slate-500">{text}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}

export function LandingPage() {
  const benefits = [
    ["Zero-data honesty", "Dashboards begin at zero and only move after a real submitted response."],
    ["Reusable feedback model", "All BPO categories live in dropdowns, filters, tabs, and shared dashboards."],
    ["Action routing", "Negative or urgent feedback creates a case, alert, and audit event automatically."],
  ];
  const coverage = [
    "IT / Technical Feedback",
    "Facilities Feedback",
    "Security Feedback",
    "Employee Experience",
    "Recruitment / Applicant",
    "Visitor / Client Feedback",
    "Custom Feedback",
  ];
  const steps = [
    ["1", "Capture", "Employees, applicants, visitors, clients, and support teams submit feedback in one guided form."],
    ["2", "Route", "ECE Pulse assigns teams from the selected category, priority, site, and account."],
    ["3", "Resolve", "Cases move through review, assignment, escalation, resolution, and closure verification."],
    ["4", "Audit", "Every submission, export, admin edit, and status change is logged for traceability."],
  ];
  return (
    <main className="overflow-hidden bg-[#051424] text-white">
      <section className="relative mx-auto grid min-h-[760px] max-w-[1440px] items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[0.95fr_1fr] lg:px-8">
        <div className="absolute left-1/2 top-20 h-72 w-72 rounded-full bg-cyan-300/10 blur-3xl" />
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
          <p className="inline-flex rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-cyan-200">ECE Pulse Executive Command</p>
          <h1 className="mt-7 max-w-[720px] text-[32px] font-black leading-[1.08] tracking-[-0.04em] text-white sm:text-[44px] xl:text-[56px]">
            ECE Pulse: Real-Time Feedback for Better Workplace Experience
          </h1>
          <p className="mt-6 max-w-2xl text-[15px] leading-7 text-[#d4e4fa] sm:text-base">
            Collect feedback from employees, applicants, visitors, clients, IT teams, facilities, HR, payroll, and security teams across ECE Contact Centers.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/submit-feedback" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-cyan-300 px-6 text-sm font-black text-[#010f1f] shadow-[0_0_22px_rgba(0,251,251,.28)]">
              Submit Feedback <ArrowRight className="size-4" />
            </Link>
            <Link to="/dashboard" className="inline-flex min-h-12 items-center justify-center rounded-full border border-cyan-300/30 px-6 text-sm font-black text-cyan-100 hover:bg-cyan-300/10">
              View Dashboard
            </Link>
          </div>
        </motion.div>
        <LandingHeroImage />
      </section>
      <section className="mx-auto max-w-[1440px] px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-3">
          {benefits.map(([title, text]) => (
            <GlassCard key={title}>
              <p className="text-lg font-black text-white">{title}</p>
              <p className="mt-3 text-sm leading-6 text-slate-400">{text}</p>
            </GlassCard>
          ))}
        </div>
      </section>
      <section className="mx-auto grid max-w-[1440px] gap-6 px-4 pb-20 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <GlassCard>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">Feedback Coverage</p>
          <h2 className="mt-3 text-[30px] font-black leading-tight text-white">One scalable system for every BPO touchpoint.</h2>
          <p className="mt-4 text-sm leading-7 text-slate-400">No separate category pages. The same form, filters, cards, and dashboards adapt to Noel, Macias, and Consuelo.</p>
        </GlassCard>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {coverage.map((item) => (
            <GlassCard key={item} className="min-h-28">
              <CheckCircle2 className="size-5 text-cyan-200" />
              <p className="mt-4 text-sm font-black text-white">{item}</p>
            </GlassCard>
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-[1440px] px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">How It Works</p>
            <h2 className="mt-3 text-[30px] font-black leading-tight text-white">From quick pulse to tracked case.</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-slate-400">The prototype keeps the workflow visible without creating extra screens, preserving the 16-screen export-safe structure.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-4">
          {steps.map(([number, title, text]) => (
            <GlassCard key={title}>
              <span className="grid size-10 place-items-center rounded-2xl bg-cyan-300 text-sm font-black text-[#010f1f]">{number}</span>
              <p className="mt-5 text-lg font-black text-white">{title}</p>
              <p className="mt-3 text-sm leading-6 text-slate-400">{text}</p>
            </GlassCard>
          ))}
        </div>
      </section>
      <section className="mx-auto grid max-w-[1440px] gap-6 px-4 pb-20 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <GlassCard>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">Dashboard Preview</p>
          <h2 className="mt-3 text-[30px] font-black leading-tight text-white">Command center visuals, honest zero-state data.</h2>
          <p className="mt-4 text-sm leading-7 text-slate-400">KPI cards, charts, heatmaps, alerts, cases, and reports start at zero. Once the first feedback is submitted, every dashboard updates from stored responses.</p>
          <Link to="/dashboard" className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-cyan-300 px-5 text-sm font-black text-[#010f1f]">
            Explore Dashboard <ArrowRight className="size-4" />
          </Link>
        </GlassCard>
        <GlassCard className="min-h-[340px]">
          <div className="grid h-full gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-cyan-300/15 bg-[#010f1f]/55 p-4">
              <p className="text-xs font-black uppercase tracking-wider text-slate-500">Total Feedback</p>
              <p className="mt-4 text-5xl font-black text-white">0</p>
              <p className="mt-2 text-sm text-slate-400">Waiting for first response</p>
            </div>
            <div className="rounded-2xl border border-cyan-300/15 bg-[#010f1f]/55 p-4">
              <p className="text-xs font-black uppercase tracking-wider text-slate-500">Open Alerts</p>
              <p className="mt-4 text-5xl font-black text-white">0</p>
              <p className="mt-2 text-sm text-slate-400">No alerts recorded</p>
            </div>
            <div className="md:col-span-2">
              <EmptyState title="No feedback submitted yet" text="Dashboard charts will populate after a real submission." />
            </div>
          </div>
        </GlassCard>
      </section>
      <section className="mx-auto max-w-[1440px] px-4 pb-20 sm:px-6 lg:px-8">
        <GlassCard className="text-center">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-200">Ready</p>
          <h2 className="mx-auto mt-3 max-w-2xl text-[30px] font-black leading-tight text-white">Submit the first response and turn the command center live.</h2>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/submit-feedback" className="inline-flex min-h-12 items-center justify-center rounded-full bg-cyan-300 px-6 text-sm font-black text-[#010f1f]">Submit Feedback</Link>
            <Link to="/login" className="inline-flex min-h-12 items-center justify-center rounded-full border border-cyan-300/25 px-6 text-sm font-black text-cyan-100">Sign In</Link>
          </div>
        </GlassCard>
      </section>
      <footer className="border-t border-cyan-300/15 px-4 py-10 text-center text-sm text-slate-400">
        ECE Pulse Executive Command © 2026. Feedback starts from zero and updates only after submitted responses.
      </footer>
    </main>
  );
}

export function LoginScreen() {
  const navigate = useNavigate();
  const addAudit = useCommandCenter((state) => state.addAudit);
  const [email, setEmail] = useState("admin@ecepulse.local");
  const [password, setPassword] = useState("password123");
  const [show, setShow] = useState(false);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    addAudit({ user: email, action: "User login", module: "Authentication", details: "Secure login simulated.", severity: "Info" });
    navigate("/dashboard");
  };
  return <AuthScreen onSubmit={submit} email={email} setEmail={setEmail} password={password} setPassword={setPassword} show={show} setShow={setShow} />;
}

export function SignupScreen() {
  const navigate = useNavigate();
  const addAudit = useCommandCenter((state) => state.addAudit);
  const accounts = useCommandCenter((state) => state.accounts);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "Viewer", site: "Noel", account: "", department: "" });
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    addAudit({ user: form.email || "New user", action: "User signup", module: "Authentication", details: `${form.name} signed up as ${form.role}.`, severity: "Info" });
    navigate("/dashboard");
  };
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#010f1f] px-4 py-14 text-white">
      <CyberBackground />
      <form onSubmit={submit} className="relative w-full max-w-3xl rounded-[28px] border border-cyan-300/25 bg-white/[0.06] p-7 shadow-2xl backdrop-blur-xl">
        <h1 className="text-3xl font-black">Create ECE Pulse access</h1>
        <p className="mt-2 text-sm text-slate-400">Role, site, account, and department are used for demo access control.</p>
        <div className="mt-7 grid gap-4 md:grid-cols-2">
          <Field label="Full name"><TextInput value={form.name} onChange={(event) => update("name", event.target.value)} required /></Field>
          <Field label="Email"><TextInput type="email" value={form.email} onChange={(event) => update("email", event.target.value)} required /></Field>
          <Field label="Password"><TextInput type="password" value={form.password} onChange={(event) => update("password", event.target.value)} required /></Field>
          <Field label="Role"><SelectInput value={form.role} onChange={(event) => update("role", event.target.value)}>{appRoles.map((role) => <option key={role}>{role}</option>)}</SelectInput></Field>
          <Field label="Site"><SelectInput value={form.site} onChange={(event) => update("site", event.target.value)}>{Object.keys(siteFloors).map((site) => <option key={site}>{site}</option>)}</SelectInput></Field>
          <Field label="Account"><SelectInput value={form.account} onChange={(event) => update("account", event.target.value)}><option value="">Select account</option>{getAccountsForSite(accounts, form.site).map((account) => <option key={account}>{account}</option>)}</SelectInput></Field>
          <Field label="Department"><TextInput value={form.department} onChange={(event) => update("department", event.target.value)} placeholder="Operations, IT, HR..." /></Field>
        </div>
        <button className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-cyan-300 px-5 text-sm font-black text-[#010f1f]">
          <UserPlus className="size-4" /> Sign up
        </button>
      </form>
    </main>
  );
}

function AuthScreen({ onSubmit, email, setEmail, password, setPassword, show, setShow }: { onSubmit: (event: FormEvent) => void; email: string; setEmail: (value: string) => void; password: string; setPassword: (value: string) => void; show: boolean; setShow: (value: boolean) => void }) {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#010f1f] px-4 py-14 text-white">
      <CyberBackground />
      <form onSubmit={onSubmit} className="relative w-full max-w-md rounded-[28px] border border-cyan-300/25 bg-white/[0.06] p-7 text-center shadow-2xl backdrop-blur-xl">
        <div className="mx-auto grid size-16 place-items-center rounded-3xl bg-cyan-300 text-[#010f1f] shadow-[0_0_22px_rgba(0,242,254,.35)]"><LockKeyhole className="size-8" /></div>
        <h1 className="mt-6 text-4xl font-black">ECE Pulse</h1>
        <p className="mt-2 text-sm uppercase tracking-[0.22em] text-slate-400">Secure command login</p>
        <div className="mt-7 space-y-4 text-left">
          <Field label="Email address"><div className="relative"><Mail className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-cyan-300" /><TextInput className="pl-11" value={email} onChange={(event) => setEmail(event.target.value)} /></div></Field>
          <Field label="Password"><div className="relative"><TextInput type={show ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} /><button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"><Eye className="size-4" /></button></div></Field>
        </div>
        <div className="mt-5 flex items-center justify-between text-sm text-slate-400"><label><input type="checkbox" className="mr-2 accent-cyan-300" />Remember me</label><a href="#" className="text-cyan-300">Forgot password?</a></div>
        <button className="mt-7 min-h-12 w-full rounded-full bg-cyan-300 text-sm font-black text-[#010f1f]">Initialize Login</button>
        <p className="mt-5 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-xs leading-5 text-cyan-100">Security notice: access is simulated for this frontend prototype; audit logs still record login actions.</p>
      </form>
    </main>
  );
}

function CyberBackground() {
  return (
    <>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,242,254,.2),transparent_30%),radial-gradient(circle_at_80%_70%,rgba(48,209,88,.12),transparent_26%)]" />
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(rgba(0,242,254,.16) 1px, transparent 1px), linear-gradient(90deg, rgba(0,242,254,.16) 1px, transparent 1px)", backgroundSize: "44px 44px" }} />
    </>
  );
}

export function SubmitFeedbackPage() {
  const submitFeedback = useCommandCenter((state) => state.submitFeedback);
  const accounts = useCommandCenter((state) => state.accounts);
  const { showToast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [createdCase, setCreatedCase] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    contact: "",
    roleType: "Employee",
    site: "Noel" as SiteName,
    floor: "Ground Floor",
    account: "",
    category: feedbackCategoryGroups[0].group,
    subcategory: feedbackCategoryGroups[0].subcategories[0],
    rating: undefined as RatingLabel | undefined,
    ratingScore: 0,
    priority: "Low" as Priority,
    description: "",
    attachmentName: "",
  });
  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((current) => ({ ...current, [key]: value }));
  const selectedGroup = feedbackCategoryGroups.find((group) => group.group === form.category) ?? feedbackCategoryGroups[0];
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.rating) {
      showToast({ title: "Choose a rating", message: "Please select a smiley rating before submitting.", type: "info" });
      return;
    }
    const record = submitFeedback({ ...form, rating: form.rating });
    const actionable = form.priority === "High" || form.priority === "Critical" || form.ratingScore <= 2;
    setCreatedCase(actionable ? record.caseId : null);
    setConfirmOpen(true);
    showToast({ title: "Feedback submitted", message: actionable ? "Case created and routed to the right team." : "Thank you. Your feedback was recorded.", type: "success" });
  };
  return (
    <PageFrame eyebrow="Feedback Submission" title="Submit workplace feedback" text="One reusable form handles every BPO category through site, account, category, and subcategory dropdowns.">
      <form onSubmit={submit} className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
        <GlassCard className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Full name"><TextInput required value={form.fullName} onChange={(event) => update("fullName", event.target.value)} /></Field>
            <Field label="Email/contact optional"><TextInput value={form.contact} onChange={(event) => update("contact", event.target.value)} /></Field>
            <Field label="Role type"><SelectInput value={form.roleType} onChange={(event) => update("roleType", event.target.value)}>{roleTypes.map((role) => <option key={role}>{role}</option>)}</SelectInput></Field>
            <Field label="Site"><SelectInput value={form.site} onChange={(event) => { const site = event.target.value as SiteName; update("site", site); update("floor", siteFloors[site][0]); update("account", ""); }}>{Object.keys(siteFloors).map((site) => <option key={site}>{site}</option>)}</SelectInput></Field>
            <Field label="Floor"><SelectInput value={form.floor} onChange={(event) => update("floor", event.target.value)}>{siteFloors[form.site].map((floor) => <option key={floor}>{floor}</option>)}</SelectInput></Field>
            <Field label="Account/campaign"><SelectInput required value={form.account} onChange={(event) => update("account", event.target.value)}><option value="">Select account</option>{getAccountsForSite(accounts, form.site).map((account) => <option key={account}>{account}</option>)}</SelectInput></Field>
            <Field label="Feedback category"><SelectInput value={form.category} onChange={(event) => { const category = event.target.value; update("category", category); update("subcategory", feedbackCategoryGroups.find((group) => group.group === category)?.subcategories[0] ?? ""); }}>{feedbackCategoryGroups.map((group) => <option key={group.group}>{group.group}</option>)}</SelectInput></Field>
            <Field label="Subcategory"><SelectInput value={form.subcategory} onChange={(event) => update("subcategory", event.target.value)}>{selectedGroup.subcategories.map((item) => <option key={item}>{item}</option>)}</SelectInput></Field>
            <Field label="Priority"><SelectInput value={form.priority} onChange={(event) => update("priority", event.target.value as Priority)}>{priorities.map((item) => <option key={item}>{item}</option>)}</SelectInput></Field>
            <Field label="Attachment upload"><TextInput type="file" onChange={(event) => update("attachmentName", event.target.files?.[0]?.name ?? "")} /></Field>
          </div>
          <Field label="Description/comment"><textarea required value={form.description} onChange={(event) => update("description", event.target.value)} className="min-h-32 w-full rounded-2xl border border-white/10 bg-[#010f1f]/70 p-4 text-sm text-white outline-none focus:border-cyan-300" /></Field>
        </GlassCard>
        <GlassCard>
          <h2 className="text-xl font-black text-white">Rating</h2>
          <p className="mt-2 text-sm text-slate-400">Tap the smiley that best matches the experience.</p>
          <div className="mt-5"><SmileyRating value={form.rating} onChange={(rating, score) => { update("rating", rating); update("ratingScore", score); }} /></div>
          <button className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-cyan-300 px-5 text-sm font-black text-[#010f1f]">
            Submit feedback <ArrowRight className="size-4" />
          </button>
        </GlassCard>
      </form>
      <Modal title="Thank you for your feedback" open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <div className="text-center">
          <CheckCircle2 className="mx-auto size-16 text-emerald-300" />
          <p className="mt-4 text-lg font-black">{createdCase ? "Case created" : "Feedback recorded"}</p>
          <p className="mt-2 text-sm text-slate-400">{createdCase ? `Case ${createdCase} was routed for action.` : "No action case was needed for this feedback."}</p>
        </div>
      </Modal>
    </PageFrame>
  );
}

export function DashboardPage() {
  const feedback = useCommandCenter((state) => state.feedback);
  const alerts = useCommandCenter((state) => state.alerts);
  const summary = getSummary(feedback, alerts);
  const hasData = feedback.length > 0;
  return (
    <PageFrame eyebrow="Main Executive Dashboard" title="ECE Pulse Command Center" text="All metrics start at zero and update only when feedback is submitted.">
      <FilterBar />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total Feedback" value={summary.total} helper={hasData ? "Submitted responses" : "0 responses"} />
        <KpiCard label="Satisfaction Score" value={`${summary.satisfactionScore}%`} helper={hasData ? "Satisfied + very satisfied" : "Waiting for first response"} tone="green" />
        <KpiCard label="Open Alerts" value={summary.openAlerts} helper={alerts.length ? "Active alerts" : "No alerts recorded"} tone="red" />
        <KpiCard label="Resolved Feedback" value={summary.resolved} helper="Closed or resolved cases" tone="green" />
        <KpiCard label="Urgent Feedback" value={summary.urgent} helper="High or critical priority" tone="orange" />
        <KpiCard label="Average Rating" value={summary.averageRating} helper={hasData ? "Average smiley score" : "Waiting for first response"} tone="cyan" />
        <KpiCard label="New Cases" value={summary.newCases} helper="Action cases awaiting review" tone="yellow" />
        <KpiCard label="SLA Warnings" value={summary.slaWarnings} helper="Urgent unresolved cases" tone="red" />
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <GlassCard>
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-black text-white">Global Satisfaction Yearly Heatmap</h2>
              <p className="mt-1 text-sm text-slate-400">{hasData ? "Activity appears on submitted feedback dates." : "Waiting for first response."}</p>
            </div>
            <span className="rounded-full border border-cyan-300/20 px-3 py-1 text-xs font-black text-cyan-100">Less to More</span>
          </div>
          <YearlyHeatmapPanel feedback={feedback} />
        </GlassCard>
        <GlassCard>
          <h2 className="mb-4 font-black text-white">Real-time Tracking</h2>
          <LiveTrackingPanel hasData={hasData} />
        </GlassCard>
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <GlassCard className="xl:col-span-2">
          <h2 className="mb-4 font-black text-white">Feedback Volume Trend</h2>
          <ChartOrEmpty hasData={hasData}>
            <div className="h-72"><ResponsiveContainer><LineChart data={getTrend(feedback)}><CartesianGrid stroke="rgba(255,255,255,.08)" /><XAxis dataKey="name" stroke="#b9cacb" /><YAxis stroke="#b9cacb" allowDecimals={false} /><Tooltip contentStyle={tooltip} /><Line type="monotone" dataKey="value" stroke="#00F2FE" strokeWidth={3} /></LineChart></ResponsiveContainer></div>
          </ChartOrEmpty>
        </GlassCard>
        <GlassCard>
          <h2 className="mb-4 font-black text-white">Total Feedback Donut</h2>
          <ChartOrEmpty hasData={hasData}>
            <div className="h-72"><ResponsiveContainer><PieChart><Pie data={getRatingDistribution(feedback)} dataKey="value" innerRadius={62} outerRadius={96}>{getRatingDistribution(feedback).map((entry, index) => <Cell key={entry.name} fill={chartColors[index]} />)}</Pie><Tooltip contentStyle={tooltip} /></PieChart></ResponsiveContainer></div>
          </ChartOrEmpty>
        </GlassCard>
        <GlassCard>
          <h2 className="mb-4 font-black text-white">Site Comparison</h2>
          <ChartOrEmpty hasData={hasData}><SimpleBar data={getSiteData(feedback)} /></ChartOrEmpty>
        </GlassCard>
        <GlassCard>
          <h2 className="mb-4 font-black text-white">Priority Distribution</h2>
          <ChartOrEmpty hasData={hasData}><SimpleBar data={groupCount(feedback, (item) => item.priority, priorities)} /></ChartOrEmpty>
        </GlassCard>
        <GlassCard>
          <h2 className="mb-4 font-black text-white">Category Breakdown</h2>
          <ChartOrEmpty hasData={hasData}><SimpleBar data={getCategoryData(feedback)} /></ChartOrEmpty>
        </GlassCard>
        <GlassCard>
          <h2 className="mb-4 font-black text-white">Status Distribution</h2>
          <ChartOrEmpty hasData={hasData}><SimpleBar data={groupCount(feedback, (item) => item.status, statuses)} /></ChartOrEmpty>
        </GlassCard>
        <GlassCard>
          <h2 className="mb-4 font-black text-white">Latest Feedback</h2>
          {hasData ? <FeedbackMiniList /> : <EmptyState title="No feedback submitted yet" />}
        </GlassCard>
        <GlassCard>
          <h2 className="mb-4 font-black text-white">Alerts Summary</h2>
          <AlertSummaryPanel alerts={alerts} />
        </GlassCard>
      </div>
    </PageFrame>
  );
}

function YearlyHeatmapPanel({ feedback }: { feedback: ReturnType<typeof useCommandCenter.getState>["feedback"] }) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyCounts = months.map((_, monthIndex) => feedback.filter((item) => new Date(item.createdAt).getMonth() === monthIndex).length);
  const max = Math.max(1, ...monthlyCounts);
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[880px] rounded-2xl border border-cyan-300/15 bg-[#010f1f]/55 p-4">
        <div className="grid grid-cols-12 gap-2">
          {months.map((month, monthIndex) => {
            const count = monthlyCounts[monthIndex];
            return (
              <div key={month}>
                <p className="mb-2 text-center text-[11px] font-bold text-slate-500">{month}</p>
                <div className="grid grid-cols-2 gap-1">
                  {Array.from({ length: 8 }).map((_, cellIndex) => {
                    const active = count > cellIndex / 2;
                    const strength = active ? 0.16 + (count / max) * 0.58 : 0;
                    return (
                      <div
                        key={`${month}-${cellIndex}`}
                        title={`${month}: ${count} feedback`}
                        className="h-4 rounded-[5px] border border-white/[0.05]"
                        style={{ backgroundColor: active ? `rgba(0,251,251,${strength})` : "rgba(255,255,255,0.035)" }}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function LiveTrackingPanel({ hasData }: { hasData: boolean }) {
  const steps = [
    ["Alert detected", hasData ? "Latest case created" : "Waiting"],
    ["STL assigned", hasData ? "Routing ready" : "No case yet"],
    ["In resolution", hasData ? "Track status" : "No case yet"],
    ["Resolved", hasData ? "Closure verified" : "No case yet"],
  ];
  return (
    <div className="space-y-4">
      {steps.map(([label, helper], index) => (
        <div key={label} className="flex gap-3">
          <span className={`mt-1 size-3 rounded-full ${hasData && index === 0 ? "bg-cyan-300 shadow-[0_0_14px_rgba(0,251,251,.7)]" : "bg-white/15"}`} />
          <div>
            <p className="text-sm font-black text-white">{label}</p>
            <p className="text-xs text-slate-500">{helper}</p>
          </div>
        </div>
      ))}
      {!hasData ? <p className="rounded-2xl border border-cyan-300/15 bg-cyan-300/5 p-3 text-xs leading-5 text-cyan-100">No cases assigned yet. Tracking begins after feedback creates an action item.</p> : null}
    </div>
  );
}

function AlertSummaryPanel({ alerts }: { alerts: ReturnType<typeof useCommandCenter.getState>["alerts"] }) {
  if (!alerts.length) return <EmptyState title="No alerts recorded" text="Negative or high-priority feedback will appear here." />;
  return (
    <div className="space-y-3">
      {alerts.slice(0, 4).map((alert) => (
        <div key={alert.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-black text-white">{alert.title}</p>
            <PriorityBadge priority={alert.priority} />
          </div>
          <p className="mt-2 text-xs text-slate-500">{alert.site} / {alert.account}</p>
        </div>
      ))}
    </div>
  );
}

function SimpleBar({ data }: { data: Array<{ name: string; value: number }> }) {
  return <div className="h-72"><ResponsiveContainer><BarChart data={data}><CartesianGrid stroke="rgba(255,255,255,.08)" vertical={false} /><XAxis dataKey="name" stroke="#b9cacb" fontSize={11} /><YAxis stroke="#b9cacb" allowDecimals={false} /><Tooltip contentStyle={tooltip} /><Bar dataKey="value" fill="#00F2FE" radius={[10, 10, 0, 0]} /></BarChart></ResponsiveContainer></div>;
}

function FeedbackMiniList() {
  const feedback = useCommandCenter((state) => state.feedback);
  return <div className="space-y-3">{feedback.slice(0, 5).map((item) => <Link key={item.id} to={`/case/${item.caseId}`} className="block rounded-2xl bg-white/[0.04] p-3 hover:bg-cyan-300/10"><p className="font-bold text-white">{item.caseId} - {item.subcategory}</p><p className="text-sm text-slate-400">{item.site} / {item.account}</p></Link>)}</div>;
}

export function PulseFeedPage() {
  const feedback = useCommandCenter((state) => state.feedback);
  const updateStatus = useCommandCenter((state) => state.updateCaseStatus);
  const [view, setView] = useState<"Table" | "Card">("Table");
  return (
    <PageFrame eyebrow="Pulse Feed" title="Feedback Inbox" text="Central inbox for submitted feedback with filters, table/card views, and case actions.">
      <FilterBar />
      <div className="mb-4 flex justify-end gap-2">{["Table", "Card"].map((item) => <button key={item} onClick={() => setView(item as "Table" | "Card")} className="rounded-full border border-cyan-300/20 px-4 py-2 text-sm font-bold text-cyan-100">{item} view</button>)}</div>
      {!feedback.length ? <EmptyState title="No feedback submitted yet" text="Pulse Feed will populate after the first response." /> : view === "Table" ? (
        <GlassCard><div className="overflow-x-auto"><table className="w-full min-w-[920px] text-left text-sm"><thead className="text-xs uppercase tracking-wider text-slate-400"><tr>{["Case ID", "Rating", "Category", "Subcategory", "Site", "Account", "Priority", "Status", "Actions"].map((head) => <th key={head} className="px-3 py-3">{head}</th>)}</tr></thead><tbody>{feedback.map((item) => <tr key={item.id} className="border-t border-white/10"><td className="px-3 py-3 font-black text-cyan-300"><Link to={`/case/${item.caseId}`}>{item.caseId}</Link></td><td className="px-3 py-3">{item.rating}</td><td className="px-3 py-3">{item.category}</td><td className="px-3 py-3">{item.subcategory}</td><td className="px-3 py-3">{item.site}</td><td className="px-3 py-3">{item.account}</td><td className="px-3 py-3"><PriorityBadge priority={item.priority} /></td><td className="px-3 py-3"><StatusBadge status={item.status} /></td><td className="px-3 py-3"><button onClick={() => updateStatus(item.caseId, "Reviewed")} className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold">Mark reviewed</button></td></tr>)}</tbody></table></div></GlassCard>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{feedback.map((item) => <GlassCard key={item.id}><Link to={`/case/${item.caseId}`} className="text-lg font-black text-cyan-300">{item.caseId}</Link><p className="mt-2 text-sm text-slate-300">{item.subcategory}</p><div className="mt-4 flex flex-wrap gap-2"><PriorityBadge priority={item.priority} /><StatusBadge status={item.status} /></div><p className="mt-4 text-sm text-slate-400">{item.site} / {item.account} / {item.floor}</p></GlassCard>)}</div>
      )}
    </PageFrame>
  );
}

export function CaseDetailPage() {
  const { id } = useParams();
  const feedback = useCommandCenter((state) => state.feedback);
  const updateStatus = useCommandCenter((state) => state.updateCaseStatus);
  const addNote = useCommandCenter((state) => state.addCaseNote);
  const [note, setNote] = useState("");
  const item = feedback.find((record) => record.caseId === id || record.id === id);
  if (!item) return <PageFrame eyebrow="Case Management" title="Feedback Detail / Case Management"><EmptyState title="No case found" text="Submit feedback first, then open a case from Pulse Feed." /></PageFrame>;
  return (
    <PageFrame eyebrow="Case Management" title={item.caseId} text={`${item.category} / ${item.subcategory}`}>
      <div className="grid gap-5 lg:grid-cols-[1fr_0.7fr]">
        <GlassCard>
          <div className="grid gap-4 md:grid-cols-2">{[
            ["Submitter", item.fullName], ["Role", item.roleType], ["Contact", item.contact || "Not provided"], ["Site", item.site], ["Account", item.account], ["Floor", item.floor], ["Rating", item.rating], ["Assigned team", item.assignedTeam],
          ].map(([label, value]) => <div key={label} className="rounded-2xl bg-white/[0.035] p-4"><p className="text-xs uppercase tracking-wider text-slate-500">{label}</p><p className="mt-2 font-black text-white">{value}</p></div>)}</div>
          <div className="mt-5 rounded-2xl bg-white/[0.035] p-4"><p className="text-xs uppercase tracking-wider text-slate-500">Description</p><p className="mt-2 text-slate-200">{item.description}</p></div>
          <div className="mt-5 flex flex-wrap gap-2">{statuses.map((status) => <button key={status} onClick={() => updateStatus(item.caseId, status)} className="rounded-full border border-cyan-300/20 px-3 py-2 text-xs font-black text-cyan-100 hover:bg-cyan-300/10">{status}</button>)}</div>
        </GlassCard>
        <GlassCard>
          <h2 className="font-black text-white">Timeline</h2>
          <div className="mt-4 space-y-4">{item.timeline.map((event, index) => <div key={`${event.at}-${index}`} className="border-l border-cyan-300/30 pl-4"><p className="font-bold text-cyan-200">{event.label}</p><p className="text-xs text-slate-500">{new Date(event.at).toLocaleString()}</p><p className="mt-1 text-sm text-slate-300">{event.detail}</p></div>)}</div>
          <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Internal notes" className="mt-5 min-h-24 w-full rounded-2xl border border-white/10 bg-[#010f1f]/70 p-3 text-sm outline-none focus:border-cyan-300" />
          <button onClick={() => { if (note) { addNote(item.caseId, note); setNote(""); } }} className="mt-3 rounded-full bg-cyan-300 px-4 py-2 text-sm font-black text-[#010f1f]">Add note</button>
        </GlassCard>
      </div>
    </PageFrame>
  );
}

export function AnalyticsPage() {
  const feedback = useCommandCenter((state) => state.feedback);
  const hasData = feedback.length > 0;
  return (
    <PageFrame eyebrow="Analytics Overview" title="Feedback Analytics" text="Satisfaction trend, category ranking, site comparison, account comparison, floor comparison, sentiment, volume, priority, status aging, and SLA trend.">
      <FilterBar />
      <div className="grid gap-5 lg:grid-cols-2">
        {[
          ["Satisfaction trend", <SimpleBar data={getTrend(feedback)} />],
          ["Category ranking", <SimpleBar data={getCategoryData(feedback)} />],
          ["Site comparison", <SimpleBar data={getSiteData(feedback)} />],
          ["Priority distribution", <SimpleBar data={groupCount(feedback, (item) => item.priority, priorities)} />],
          ["Sentiment distribution", <SimpleBar data={getRatingDistribution(feedback)} />],
          ["Status aging", <SimpleBar data={groupCount(feedback, (item) => item.status, statuses)} />],
        ].map(([title, chart]) => <GlassCard key={String(title)}><h2 className="mb-4 font-black text-white">{title}</h2><ChartOrEmpty hasData={hasData}>{chart}</ChartOrEmpty></GlassCard>)}
      </div>
    </PageFrame>
  );
}

export function SitesPage() {
  const feedback = useCommandCenter((state) => state.feedback);
  const accounts = useCommandCenter((state) => state.accounts);
  const [site, setSite] = useState<SiteName>("Noel");
  const siteFeedback = feedback.filter((item) => item.site === site);
  const summary = getSummary(siteFeedback, []);
  return (
    <PageFrame eyebrow="Site Performance" title="Site Performance Dashboard" text="Reusable tabs for Noel, Macias, and Consuelo. Data comes only from submitted feedback.">
      <div className="mb-5 flex gap-2">{(["Noel", "Macias", "Consuelo"] as const).map((item) => <button key={item} onClick={() => setSite(item)} className={`rounded-full px-5 py-2 text-sm font-black ${site === item ? "bg-cyan-300 text-[#010f1f]" : "border border-cyan-300/20 text-cyan-100"}`}>{item}</button>)}</div>
      <div className="grid gap-4 md:grid-cols-4"><KpiCard label="Total feedback" value={summary.total} helper="Submitted responses" /><KpiCard label="Satisfaction" value={`${summary.satisfactionScore}%`} helper="Site score" /><KpiCard label="Open cases" value={siteFeedback.filter((item) => !["Resolved", "Closed"].includes(item.status)).length} helper="Needs attention" /><KpiCard label="Priority cases" value={siteFeedback.filter((item) => ["High", "Critical"].includes(item.priority)).length} helper="High/Critical" /></div>
      <div className="mt-5 grid gap-5 lg:grid-cols-2"><GlassCard><h2 className="mb-4 font-black text-white">Accounts under {site}</h2><div className="flex flex-wrap gap-2">{getAccountsForSite(accounts, site).map((account) => <span key={account} className="rounded-full bg-cyan-300/10 px-3 py-1 text-sm font-bold text-cyan-100">{account}</span>)}</div></GlassCard><GlassCard><h2 className="mb-4 font-black text-white">Trend</h2><ChartOrEmpty hasData={siteFeedback.length > 0}><SimpleBar data={getTrend(siteFeedback)} /></ChartOrEmpty></GlassCard></div>
    </PageFrame>
  );
}

export function AccountsPage() {
  const feedback = useCommandCenter((state) => state.feedback);
  const accounts = useCommandCenter((state) => state.accounts);
  const enabled = accounts.filter((account) => account.enabled);
  const [selected, setSelected] = useState(enabled[0]?.name ?? "");
  const rows = feedback.filter((item) => item.account === selected);
  return (
    <PageFrame eyebrow="Account Performance" title="Account Performance Dashboard" text="Select any account from Noel, Macias, or Consuelo using a dropdown filter.">
      <GlassCard className="mb-5"><Field label="Account"><SelectInput value={selected} onChange={(event) => setSelected(event.target.value)}>{enabled.map((account) => <option key={account.id}>{account.name}</option>)}</SelectInput></Field></GlassCard>
      <div className="grid gap-4 md:grid-cols-4"><KpiCard label="Account feedback score" value={rows.length ? `${getSummary(rows, []).satisfactionScore}%` : "0%"} helper="Starts from zero" /><KpiCard label="Total feedback" value={rows.length} helper="Submitted responses" /><KpiCard label="Open issues" value={rows.filter((item) => !["Resolved", "Closed"].includes(item.status)).length} helper="Unresolved cases" /><KpiCard label="Priority cases" value={rows.filter((item) => ["High", "Critical"].includes(item.priority)).length} helper="High/Critical" /></div>
      <div className="mt-5 grid gap-5 lg:grid-cols-2"><GlassCard><h2 className="mb-4 font-black text-white">Top complaints</h2><ChartOrEmpty hasData={rows.length > 0}><SimpleBar data={getCategoryData(rows)} /></ChartOrEmpty></GlassCard><GlassCard><h2 className="mb-4 font-black text-white">Latest feedback</h2>{rows.length ? <div className="space-y-3">{rows.slice(0, 5).map((row) => <Link key={row.id} to={`/case/${row.caseId}`} className="block rounded-2xl bg-white/[0.04] p-3 text-sm text-slate-300">{row.caseId} - {row.subcategory}</Link>)}</div> : <EmptyState title="No feedback submitted yet" />}</GlassCard></div>
    </PageFrame>
  );
}

export function CategoriesPage() {
  const feedback = useCommandCenter((state) => state.feedback);
  const [category, setCategory] = useState(feedbackCategoryGroups[0].group);
  const rows = feedback.filter((item) => item.category === category);
  const selected = feedbackCategoryGroups.find((item) => item.group === category) ?? feedbackCategoryGroups[0];
  return (
    <PageFrame eyebrow="Category Performance" title="Category Performance Dashboard" text="A single reusable dashboard handles Internet, WiFi, AC, Security, Recruitment, Visitor Feedback, Facilities, IT Tools, Workstation, HR/Employee Experience, and Custom/Others.">
      <GlassCard className="mb-5"><Field label="Category"><SelectInput value={category} onChange={(event) => setCategory(event.target.value)}>{feedbackCategoryGroups.map((group) => <option key={group.group}>{group.group}</option>)}</SelectInput></Field></GlassCard>
      <div className="grid gap-4 md:grid-cols-4"><KpiCard label="Category feedback" value={rows.length} helper={selected.dashboardLabel} /><KpiCard label="Satisfaction" value={`${getSummary(rows, []).satisfactionScore}%`} helper="Submitted responses only" /><KpiCard label="Open cases" value={rows.filter((item) => !["Resolved", "Closed"].includes(item.status)).length} helper="Needs action" /><KpiCard label="Severity" value={rows.filter((item) => item.priority === "Critical").length} helper="Critical items" /></div>
      <div className="mt-5 grid gap-5 lg:grid-cols-2"><GlassCard><h2 className="mb-4 font-black text-white">Subcategory breakdown</h2><ChartOrEmpty hasData={rows.length > 0}><SimpleBar data={selected.subcategories.map((sub) => ({ name: sub, value: rows.filter((item) => item.subcategory === sub).length }))} /></ChartOrEmpty></GlassCard><GlassCard><h2 className="mb-4 font-black text-white">Common comments</h2>{rows.length ? rows.slice(0, 5).map((row) => <p key={row.id} className="mb-3 rounded-2xl bg-white/[0.04] p-3 text-sm text-slate-300">{row.description}</p>) : <EmptyState title="No feedback submitted yet" />}</GlassCard></div>
    </PageFrame>
  );
}

export function AlertsPage() {
  const alerts = useCommandCenter((state) => state.alerts);
  return (
    <PageFrame eyebrow="Alerts & Escalation" title="Alerts & Escalation Center" text="Urgent issues, outages, unresolved complaints, SLA warnings, escalated feedback, and status tracking.">
      <FilterBar compact />
      {!alerts.length ? <EmptyState title="No alerts recorded" text="High, critical, or negative feedback will create alerts." /> : <div className="grid gap-4">{alerts.map((alert) => <GlassCard key={alert.id}><div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><p className="text-lg font-black text-white">{alert.title}</p><p className="mt-1 text-sm text-slate-400">{alert.site} / {alert.account} / {alert.category}</p><p className="mt-2 text-sm text-slate-300">{alert.details}</p></div><div className="flex gap-2"><PriorityBadge priority={alert.priority} /><StatusBadge status={alert.status} /></div></div></GlassCard>)}</div>}
    </PageFrame>
  );
}

export function ReportsPage() {
  const history = useCommandCenter((state) => state.reportHistory);
  const exportReport = useCommandCenter((state) => state.exportReport);
  const { showToast } = useToast();
  const [type, setType] = useState(reportTypes[0]);
  const doExport = (format: string) => {
    exportReport(`${type} - ${format}`, "Current filter set");
    showToast({ title: `${format} export simulated.`, message: "Report history and audit logs were updated.", type: "success" });
  };
  return (
    <PageFrame eyebrow="Reporting Center" title="Generate Reports" text="Weekly, monthly, site-level, account-level, category-level, and executive reports with simulated exports.">
      <FilterBar />
      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]"><GlassCard><Field label="Report type"><SelectInput value={type} onChange={(event) => setType(event.target.value as typeof reportTypes[number])}>{reportTypes.map((report) => <option key={report}>{report}</option>)}</SelectInput></Field><div className="mt-5 grid gap-3 sm:grid-cols-3">{["PDF", "Excel", "PowerPoint"].map((format) => <button key={format} onClick={() => doExport(format)} className="rounded-2xl border border-cyan-300/20 p-5 text-left font-black text-cyan-100 hover:bg-cyan-300/10"><Download className="mb-4 size-5" />{format}</button>)}</div></GlassCard><GlassCard><h2 className="mb-4 font-black text-white">Report history</h2>{history.length ? history.map((report) => <div key={report.id} className="mb-3 rounded-2xl bg-white/[0.04] p-3"><p className="font-bold text-white">{report.type}</p><p className="text-xs text-slate-500">{new Date(report.createdAt).toLocaleString()}</p></div>) : <EmptyState title="No reports generated yet" />}</GlassCard></div>
    </PageFrame>
  );
}

export function AdminPage() {
  const accounts = useCommandCenter((state) => state.accounts);
  const addAccount = useCommandCenter((state) => state.addAccount);
  const updateAccount = useCommandCenter((state) => state.updateAccount);
  const addAudit = useCommandCenter((state) => state.addAudit);
  const { showToast } = useToast();
  const [modal, setModal] = useState<"account" | "category" | null>(null);
  const [newAccount, setNewAccount] = useState({ name: "", site: "Noel" });
  const saveAccount = () => { if (newAccount.name) { addAccount(newAccount.name, newAccount.site); setModal(null); showToast({ title: "Account added", message: "Account management updated.", type: "success" }); } };
  return (
    <PageFrame eyebrow="Admin Settings" title="Admin Settings" text="Manage sites, floors, accounts, feedback categories, subcategories, SLA rules, notifications, branding, and security settings.">
      <div className="mb-5 flex flex-wrap gap-3"><button onClick={() => setModal("account")} className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-5 py-3 text-sm font-black text-[#010f1f]"><Plus className="size-4" /> Add account</button><button onClick={() => setModal("category")} className="rounded-full border border-cyan-300/25 px-5 py-3 text-sm font-black text-cyan-100">Manage categories</button></div>
      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]"><GlassCard><h2 className="mb-4 font-black text-white">Account management</h2><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="text-xs uppercase tracking-wider text-slate-400"><tr><th className="px-3 py-3">Account</th><th>Site</th><th>Status</th><th>Reassign</th><th>Action</th></tr></thead><tbody>{accounts.map((account) => <tr key={account.id} className="border-t border-white/10"><td className="px-3 py-3 font-bold text-white">{account.name}</td><td>{account.site}</td><td>{account.enabled ? "Enabled" : "Disabled"}</td><td><SelectInput value={account.site} onChange={(event) => updateAccount(account.id, { site: event.target.value })}>{Object.keys(siteFloors).map((site) => <option key={site}>{site}</option>)}</SelectInput></td><td><button onClick={() => updateAccount(account.id, { enabled: !account.enabled })} className="rounded-full bg-white/10 px-3 py-1 text-xs font-black">{account.enabled ? "Disable" : "Enable"}</button></td></tr>)}</tbody></table></div></GlassCard><GlassCard><h2 className="mb-4 font-black text-white">Security settings</h2>{["Role-based access control", "Admin-only settings", "Audit logs", "Site/account permissions", "No exposed secrets"].map((item) => <p key={item} className="mb-3 flex items-center gap-2 text-sm text-slate-300"><ShieldCheck className="size-4 text-cyan-300" />{item}</p>)}<button onClick={() => { addAudit({ user: "Admin", action: "Settings saved", module: "Admin", details: "Admin settings saved.", severity: "Info" }); showToast({ title: "Settings saved", message: "Admin settings saved for this prototype.", type: "success" }); }} className="mt-5 rounded-full bg-cyan-300 px-5 py-3 text-sm font-black text-[#010f1f]">Save settings</button></GlassCard></div>
      <Modal title="Add account" open={modal === "account"} onClose={() => setModal(null)}><div className="grid gap-4"><Field label="Account name"><TextInput value={newAccount.name} onChange={(event) => setNewAccount({ ...newAccount, name: event.target.value })} /></Field><Field label="Site"><SelectInput value={newAccount.site} onChange={(event) => setNewAccount({ ...newAccount, site: event.target.value })}>{Object.keys(siteFloors).map((site) => <option key={site}>{site}</option>)}</SelectInput></Field><button onClick={saveAccount} className="rounded-full bg-cyan-300 px-5 py-3 text-sm font-black text-[#010f1f]">Save account</button></div></Modal>
      <Modal title="Category management" open={modal === "category"} onClose={() => setModal(null)}><div className="space-y-3">{feedbackCategoryGroups.map((group) => <div key={group.group} className="rounded-2xl bg-white/[0.04] p-4"><p className="font-black text-white">{group.group}</p><p className="mt-1 text-sm text-slate-400">{group.subcategories.length} subcategories. Add/edit/disable controls are represented here for backend wiring.</p></div>)}</div></Modal>
    </PageFrame>
  );
}

export function UsersPage() {
  const users = useCommandCenter((state) => state.users);
  const addUser = useCommandCenter((state) => state.addUser);
  const updateUser = useCommandCenter((state) => state.updateUser);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ fullName: "", email: "", role: "Viewer" as AppRole });
  return (
    <PageFrame eyebrow="User Management" title="User Management / Role Access" text="Manage role badges, permission matrix, site access, account access, and read/write behavior.">
      <button onClick={() => setOpen(true)} className="mb-5 rounded-full bg-cyan-300 px-5 py-3 text-sm font-black text-[#010f1f]">Add user</button>
      <GlassCard><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="text-xs uppercase tracking-wider text-slate-400"><tr>{["User", "Email", "Role", "Site access", "Account access", "Status", "Action"].map((head) => <th key={head} className="px-3 py-3">{head}</th>)}</tr></thead><tbody>{users.map((user) => <tr key={user.id} className="border-t border-white/10"><td className="px-3 py-3 font-bold text-white">{user.fullName}</td><td>{user.email}</td><td><span className="rounded-full bg-cyan-300/10 px-3 py-1 text-xs font-black text-cyan-100">{user.role}</span></td><td>{user.siteAccess.join(", ")}</td><td>{user.accountAccess.join(", ")}</td><td>{user.status}</td><td><button onClick={() => updateUser(user.id, { status: user.status === "Active" ? "Disabled" : "Active" })} className="rounded-full bg-white/10 px-3 py-1 text-xs font-black">Toggle</button></td></tr>)}</tbody></table></div></GlassCard>
      <GlassCard className="mt-5"><h2 className="mb-4 font-black text-white">Permission matrix</h2><div className="grid gap-3 md:grid-cols-3">{appRoles.map((role) => <div key={role} className="rounded-2xl bg-white/[0.04] p-4"><p className="font-black text-cyan-200">{role}</p><p className="mt-2 text-sm text-slate-400">{role === "Admin" ? "All modules" : role === "Viewer" ? "Read-only dashboards" : `${role} scoped feedback`}</p></div>)}</div></GlassCard>
      <Modal title="Add user" open={open} onClose={() => setOpen(false)}><div className="grid gap-4"><Field label="Full name"><TextInput value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} /></Field><Field label="Email"><TextInput value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></Field><Field label="Role"><SelectInput value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as AppRole })}>{appRoles.map((role) => <option key={role}>{role}</option>)}</SelectInput></Field><button onClick={() => { addUser({ ...form, siteAccess: ["Noel"], accountAccess: ["Assigned"], status: "Active" }); setOpen(false); }} className="rounded-full bg-cyan-300 px-5 py-3 text-sm font-black text-[#010f1f]">Save user</button></div></Modal>
    </PageFrame>
  );
}

export function AuditLogsPage() {
  const logs = useCommandCenter((state) => state.auditLogs);
  return (
    <PageFrame eyebrow="System Audit" title="System Audit / Activity Logs" text="Track submitted feedback, status changes, admin edits, category changes, account reassignment, report exports, user logins, escalations, and role changes.">
      <GlassCard className="mb-5"><div className="relative"><Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-500" /><TextInput className="pl-11" placeholder="Search/filter audit logs..." /></div></GlassCard>
      {!logs.length ? <EmptyState title="No activity logs yet" text="Audit entries will appear after login, feedback, admin edits, exports, and status changes." /> : <GlassCard><div className="overflow-x-auto"><table className="w-full min-w-[820px] text-left text-sm"><thead className="text-xs uppercase tracking-wider text-slate-400"><tr>{["Timestamp", "User", "Action", "Module", "Details", "Severity"].map((head) => <th key={head} className="px-3 py-3">{head}</th>)}</tr></thead><tbody>{logs.map((log) => <tr key={log.id} className="border-t border-white/10"><td className="px-3 py-3">{new Date(log.timestamp).toLocaleString()}</td><td>{log.user}</td><td className="font-bold text-white">{log.action}</td><td>{log.module}</td><td>{log.details}</td><td>{log.severity}</td></tr>)}</tbody></table></div></GlassCard>}
    </PageFrame>
  );
}
