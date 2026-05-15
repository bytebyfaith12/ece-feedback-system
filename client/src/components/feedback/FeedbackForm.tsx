import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Loader2, Paperclip, Send, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import type { LocationScope, SmileyRating } from "@/types/index";
import { feedbackCategories, priorityLevels, roleTypes, siteAccounts } from "@/data/echoConfig";
import { useFeedbackStore } from "@/store/useFeedbackStore";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { cn } from "@/utils/cn";

const ratings: Array<{ value: SmileyRating; emoji: string; label: string; color: string }> = [
  { value: 5, emoji: "😄", label: "Very Happy", color: "from-emerald-300 to-emerald-500" },
  { value: 4, emoji: "🙂", label: "Happy", color: "from-lime-200 to-emerald-300" },
  { value: 3, emoji: "😐", label: "Neutral", color: "from-yellow-200 to-amber-300" },
  { value: 2, emoji: "🙁", label: "Unhappy", color: "from-orange-200 to-red-300" },
  { value: 1, emoji: "😡", label: "Very Unhappy", color: "from-red-300 to-red-600" },
];

const inputClass =
  "h-12 rounded-2xl border border-cyan-300/15 bg-white/[0.04] px-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-300/45 focus:ring-2 focus:ring-cyan-300/20 disabled:cursor-not-allowed disabled:opacity-50";

const textAreaClass =
  "min-h-36 w-full rounded-3xl border border-cyan-300/15 bg-white/[0.04] p-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-300/45 focus:ring-2 focus:ring-cyan-300/20";

const areaTypeOptions = [
  {
    value: "shared-site-area",
    label: "Shared Site Area",
    description: "Elevator, pantry, security desk, smoking area, recruitment, visitor area.",
    locationScope: "site-wide",
  },
  {
    value: "floor-area",
    label: "Floor Area",
    description: "Restroom, floor cleanliness, floor temperature, workstation area.",
    locationScope: "floor-shared",
  },
  {
    value: "production-account-area",
    label: "Production / Account Area",
    description: "Ashley, Walmart, Wyze, Papaya, Flex, Macias accounts, Consuelo accounts.",
    locationScope: "account-specific",
  },
  {
    value: "department-service",
    label: "Department / Service",
    description: "IT Helpdesk, HR, Payroll, Security, Facilities, Recruitment.",
    locationScope: "department-service",
  },
] as const;

type SiteName = keyof typeof siteAccounts;
type AreaType = (typeof areaTypeOptions)[number]["value"];
type FeedbackCategory = keyof typeof feedbackCategories;
type RoleType = (typeof roleTypes)[number];

type ExactArea = {
  id: string;
  name: string;
  site: SiteName;
  areaType: AreaType;
  locationScope: LocationScope;
  description: string;
  floor?: string;
  account?: string;
};

type SubmittedState = {
  feedbackId: string;
  caseId?: string;
  status?: string;
};

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function area(site: SiteName, areaType: AreaType, name: string, description: string, details: Partial<Pick<ExactArea, "floor" | "account">> = {}): ExactArea {
  const locationScope = areaTypeOptions.find((option) => option.value === areaType)?.locationScope ?? "site-wide";
  return {
    id: `${slug(site)}-${slug(name)}`,
    name,
    site,
    areaType,
    locationScope,
    description,
    ...details,
  };
}

function productionArea(site: SiteName, account: string, displayName?: string, floor = "Production area") {
  return area(site, "production-account-area", displayName ?? `${account} Production Area`, `${account} production area.`, { account, floor });
}

const exactAreas: Record<SiteName, Record<AreaType, ExactArea[]>> = {
  Noel: {
    "shared-site-area": [
      area("Noel", "shared-site-area", "Noel Main Elevator", "Elevator shared by the Noel site.", { floor: "Site-wide" }),
      area("Noel", "shared-site-area", "Noel Pantry - 5th Floor", "Pantry area on the 5th floor.", { floor: "5th Floor" }),
      area("Noel", "shared-site-area", "Noel Security Desk", "Security desk for entries, exits, and assistance.", { floor: "Site-wide" }),
      area("Noel", "shared-site-area", "Noel Recruitment Area", "Recruitment area serving applicants and hiring operations.", { floor: "Site-wide" }),
      area("Noel", "shared-site-area", "Noel Smoking Area", "Shared smoking area for employees and approved visitors.", { floor: "Site-wide" }),
      area("Noel", "shared-site-area", "Noel Visitor Welcome Area", "Reception and welcome touchpoint for clients and visitors.", { floor: "Site-wide" }),
    ],
    "floor-area": [
      area("Noel", "floor-area", "Noel Ground Floor Restroom", "Restroom feedback for the ground floor.", { floor: "Ground Floor" }),
      area("Noel", "floor-area", "Noel 2nd Floor Restroom", "Restroom feedback for the 2nd floor.", { floor: "2nd Floor" }),
      area("Noel", "floor-area", "Noel 3rd Floor Restroom", "Restroom feedback for the 3rd floor.", { floor: "3rd Floor" }),
      area("Noel", "floor-area", "Noel 4th Floor Restroom", "Restroom feedback for the 4th floor.", { floor: "4th Floor" }),
      area("Noel", "floor-area", "Noel 5th Floor Restroom", "Restroom feedback for the 5th floor.", { floor: "5th Floor" }),
      area("Noel", "floor-area", "Noel 6th Floor Restroom", "Restroom feedback for the 6th floor.", { floor: "6th Floor" }),
      area("Noel", "floor-area", "Noel Training Room", "Training room feedback for shared learning spaces.", { floor: "Training Area" }),
      area("Noel", "floor-area", "Noel Floor Cleanliness", "Cleanliness feedback for common floor areas.", { floor: "Shared floors" }),
      area("Noel", "floor-area", "Noel AC / Temperature Comfort", "Temperature and comfort feedback for floor areas.", { floor: "Shared floors" }),
    ],
    "production-account-area": [
      productionArea("Noel", "Ashley", "Ashley Production Area", "2nd Floor"),
      productionArea("Noel", "Ashley Support", "Ashley Support Production Area", "3rd Floor"),
      productionArea("Noel", "Walmart", "Walmart Production Area", "Ground & 5th Floor"),
      productionArea("Noel", "Wyze", "Wyze Production Area", "3rd Floor"),
      productionArea("Noel", "Papaya", "Papaya Production Area", "3rd Floor"),
      productionArea("Noel", "Flex", "Flex Production Area", "6th Floor"),
      productionArea("Noel", "Bubble", "Bubble Production Area", "5th Floor"),
      productionArea("Noel", "Clearwater", "Clearwater Production Area", "5th Floor"),
      productionArea("Noel", "Resident Home", "Resident Home Production Area", "4th Floor"),
    ],
    "department-service": [
      area("Noel", "department-service", "Noel IT Helpdesk", "IT helpdesk support for the Noel site.", { floor: "All floors" }),
      area("Noel", "department-service", "Noel HR Support", "HR support for employee concerns.", { floor: "All floors" }),
      area("Noel", "department-service", "Noel Payroll Support", "Payroll support for pay and payslip concerns.", { floor: "All floors" }),
      area("Noel", "department-service", "Noel Facilities Support", "Facilities support for workplace comfort and repairs.", { floor: "All floors" }),
      area("Noel", "department-service", "Noel Security Support", "Security support for safety and access concerns.", { floor: "All floors" }),
      area("Noel", "department-service", "Noel Recruitment Support", "Recruitment support for applicants and hiring activities.", { floor: "All floors" }),
      area("Noel", "department-service", "Noel Internet / WiFi Service", "Internet and WiFi service feedback for Noel.", { floor: "All floors" }),
    ],
  },
  Macias: {
    "shared-site-area": [
      area("Macias", "shared-site-area", "Macias Pantry", "Shared pantry area for Macias.", { floor: "Site-wide" }),
      area("Macias", "shared-site-area", "Macias Restrooms", "Shared restroom feedback for Macias.", { floor: "Site-wide" }),
      area("Macias", "shared-site-area", "Macias Security Desk", "Security desk and entrance assistance.", { floor: "Site-wide" }),
      area("Macias", "shared-site-area", "Macias Recruitment / Visitor Area", "Recruitment, visitor, and client welcome area.", { floor: "Site-wide" }),
      area("Macias", "shared-site-area", "Macias Training Area", "Training and coaching area.", { floor: "Site-wide" }),
      area("Macias", "shared-site-area", "Macias Smoking Area", "Shared smoking area.", { floor: "Site-wide" }),
      area("Macias", "shared-site-area", "Macias Entrance / Reception", "Entrance, reception, and first-impression feedback.", { floor: "Site-wide" }),
    ],
    "floor-area": [],
    "production-account-area": [
      productionArea("Macias", "Earnin", "Earnin Production Area", "Ground Floor"),
      productionArea("Macias", "Homebase", "Homebase Production Area", "2nd Floor"),
      productionArea("Macias", "Minoan", "Minoan Production Area", "2nd Floor"),
      productionArea("Macias", "ILS", "ILS Production Area", "3rd Floor"),
    ],
    "department-service": [
      area("Macias", "department-service", "Macias IT Support", "IT support service for Macias.", { floor: "All floors" }),
      area("Macias", "department-service", "Macias HR Support", "HR support for Macias.", { floor: "All floors" }),
      area("Macias", "department-service", "Macias Payroll Support", "Payroll support for Macias.", { floor: "All floors" }),
      area("Macias", "department-service", "Macias Facilities Support", "Facilities support for Macias.", { floor: "All floors" }),
      area("Macias", "department-service", "Macias Security Support", "Security support for Macias.", { floor: "All floors" }),
      area("Macias", "department-service", "Macias Internet / WiFi Service", "Internet and WiFi service feedback for Macias.", { floor: "All floors" }),
    ],
  },
  Consuelo: {
    "shared-site-area": [
      area("Consuelo", "shared-site-area", "Consuelo Pantry", "Shared pantry area for Consuelo.", { floor: "Site-wide" }),
      area("Consuelo", "shared-site-area", "Consuelo Restrooms", "Shared restroom feedback for Consuelo.", { floor: "Site-wide" }),
      area("Consuelo", "shared-site-area", "Consuelo Security Desk", "Security desk and entrance assistance.", { floor: "Site-wide" }),
      area("Consuelo", "shared-site-area", "Consuelo Recruitment / Visitor Area", "Recruitment, visitor, and client welcome area.", { floor: "Site-wide" }),
      area("Consuelo", "shared-site-area", "Consuelo Training Area", "Training and coaching area.", { floor: "Site-wide" }),
      area("Consuelo", "shared-site-area", "Consuelo Smoking Area", "Shared smoking area.", { floor: "Site-wide" }),
      area("Consuelo", "shared-site-area", "Consuelo Entrance / Reception", "Entrance, reception, and first-impression feedback.", { floor: "Site-wide" }),
    ],
    "floor-area": [],
    "production-account-area": [
      productionArea("Consuelo", "Albert", "Albert Production Area"),
      productionArea("Consuelo", "Coalition", "Coalition Production Area"),
      productionArea("Consuelo", "Daily Harvest", "Daily Harvest Production Area"),
      productionArea("Consuelo", "Hippo", "Hippo Production Area"),
      productionArea("Consuelo", "IAA", "IAA Production Area"),
      productionArea("Consuelo", "Illuminz", "Illuminz Production Area"),
      productionArea("Consuelo", "IT", "IT Production Area"),
      productionArea("Consuelo", "Lytx", "Lytx Production Area"),
      productionArea("Consuelo", "NICE", "NICE Production Area"),
      productionArea("Consuelo", "OfferOps", "OfferOps Production Area"),
      productionArea("Consuelo", "Peloton", "Peloton Production Area"),
      productionArea("Consuelo", "PerfectServe", "PerfectServe Production Area"),
      productionArea("Consuelo", "PLS", "PLS Production Area"),
      productionArea("Consuelo", "RTA", "RTA Production Area"),
      productionArea("Consuelo", "Sharebite", "Sharebite Production Area"),
      productionArea("Consuelo", "Spireon", "Spireon Production Area"),
      productionArea("Consuelo", "Sundays for Dogs", "Sundays for Dogs Production Area"),
      productionArea("Consuelo", "Tremendous", "Tremendous Production Area"),
      productionArea("Consuelo", "Volume Products", "Volume Products Production Area"),
      productionArea("Consuelo", "Zenbusiness", "Zenbusiness Production Area"),
    ],
    "department-service": [
      area("Consuelo", "department-service", "Consuelo IT Support", "IT support service for Consuelo.", { floor: "All floors" }),
      area("Consuelo", "department-service", "Consuelo HR Support", "HR support for Consuelo.", { floor: "All floors" }),
      area("Consuelo", "department-service", "Consuelo Payroll Support", "Payroll support for Consuelo.", { floor: "All floors" }),
      area("Consuelo", "department-service", "Consuelo Facilities Support", "Facilities support for Consuelo.", { floor: "All floors" }),
      area("Consuelo", "department-service", "Consuelo Security Support", "Security support for Consuelo.", { floor: "All floors" }),
      area("Consuelo", "department-service", "Consuelo Internet / WiFi Service", "Internet and WiFi service feedback for Consuelo.", { floor: "All floors" }),
    ],
  },
};

function firstAvailableAreaType(site: SiteName): AreaType {
  return areaTypeOptions.find((option) => exactAreas[site][option.value].length > 0)?.value ?? "shared-site-area";
}

function firstAreaId(site: SiteName, areaType: AreaType) {
  return exactAreas[site][areaType][0]?.id ?? "";
}

function normalizeRole(role: RoleType) {
  if (role === "Applicant") return "applicant";
  if (role === "Visitor") return "visitor";
  if (role === "Client") return "customer";
  return "employee";
}

function SectionTitle({ eyebrow, title, helper }: { eyebrow: string; title: string; helper?: string }) {
  return (
    <div className="mb-5">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-200">{eyebrow}</p>
      <h2 className="display-title mt-2 text-2xl text-white">{title}</h2>
      {helper ? <p className="mt-2 text-sm leading-6 text-slate-400">{helper}</p> : null}
    </div>
  );
}

function FieldLabel({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-cyan-100/70">{label}</span>
      {children}
    </label>
  );
}

function SuccessModal({ submission, onClose }: { submission: SubmittedState | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {submission ? (
        <motion.div className="fixed inset-0 z-[10000] grid place-items-center bg-[#020b12]/80 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 12 }} className="echo-glass w-full max-w-md p-7 text-center shadow-[0_0_70px_rgba(0,242,254,0.2)]">
            <button type="button" onClick={onClose} className="ml-auto grid size-9 place-items-center rounded-full border border-cyan-300/15 bg-white/[0.04] text-slate-300 hover:bg-cyan-300/10 hover:text-white" aria-label="Close confirmation">
              <X className="size-4" />
            </button>
            <div className="relative mx-auto mt-2 grid size-20 place-items-center rounded-full bg-emerald-300/15 text-emerald-200 shadow-[0_0_50px_rgba(48,209,88,0.2)]">
              <motion.span initial={{ scale: 0.4, opacity: 0.8 }} animate={{ scale: 1.55, opacity: 0 }} transition={{ duration: 0.55, ease: "easeOut" }} className="absolute inset-0 rounded-full border border-emerald-200/60" />
              <motion.span initial={{ scale: 0.2, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 360, damping: 18 }}>
                <CheckCircle2 className="size-10" />
              </motion.span>
            </div>
            <h2 className="display-title mt-6 text-3xl text-white">Thank You</h2>
            <div className="mt-4 space-y-2 rounded-2xl border border-cyan-300/10 bg-white/[0.04] p-4 text-left text-sm text-slate-300">
              <p><span className="font-bold text-cyan-100">Feedback ID:</span> {submission.feedbackId}</p>
              <p><span className="font-bold text-cyan-100">Case ID:</span> {submission.caseId ?? "No case needed"}</p>
              <p><span className="font-bold text-cyan-100">Status:</span> {submission.status ?? "Reviewed"}</p>
            </div>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={onClose} className="rounded-2xl border border-cyan-300/25 bg-white/[0.04] px-5 py-3 text-sm font-extrabold text-cyan-100 hover:bg-cyan-300/10">
                Submit another feedback
              </button>
              <Link to="/dashboard" className="rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-extrabold text-[#031017] hover:bg-emerald-300">
                View dashboard
              </Link>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function FeedbackForm() {
  const submitFeedback = useFeedbackStore((state) => state.submitFeedback);
  const [fullName, setFullName] = useState("");
  const [contact, setContact] = useState("");
  const [roleType, setRoleType] = useState<RoleType>("Employee");
  const [siteName, setSiteName] = useState<SiteName>("Noel");
  const [areaType, setAreaType] = useState<AreaType>("shared-site-area");
  const [exactAreaId, setExactAreaId] = useState(firstAreaId("Noel", "shared-site-area"));
  const [category, setCategory] = useState<FeedbackCategory>("IT / Technical Feedback");
  const [subcategory, setSubcategory] = useState(feedbackCategories["IT / Technical Feedback"][0]);
  const [priority, setPriority] = useState<(typeof priorityLevels)[number]>("Low");
  const [rating, setRating] = useState<SmileyRating | null>(null);
  const [comment, setComment] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [submitted, setSubmitted] = useState<SubmittedState | null>(null);
  const [saving, setSaving] = useState(false);

  const currentAreaOptions = useMemo(() => exactAreas[siteName][areaType], [areaType, siteName]);
  const selectedArea = useMemo(() => currentAreaOptions.find((item) => item.id === exactAreaId) ?? currentAreaOptions[0], [currentAreaOptions, exactAreaId]);
  const selectedAreaType = areaTypeOptions.find((option) => option.value === areaType) ?? areaTypeOptions[0];
  const subcategories = useMemo(() => feedbackCategories[category], [category]);

  const updateSite = (nextSite: SiteName) => {
    const nextAreaType = exactAreas[nextSite][areaType].length ? areaType : firstAvailableAreaType(nextSite);
    setSiteName(nextSite);
    setAreaType(nextAreaType);
    setExactAreaId(firstAreaId(nextSite, nextAreaType));
  };

  const updateAreaType = (nextAreaType: AreaType) => {
    if (!exactAreas[siteName][nextAreaType].length) return;
    setAreaType(nextAreaType);
    setExactAreaId(firstAreaId(siteName, nextAreaType));
  };

  const updateCategory = (nextCategory: FeedbackCategory) => {
    setCategory(nextCategory);
    setSubcategory(feedbackCategories[nextCategory][0]);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;

    if (!anonymous && !fullName.trim()) {
      toast.error("Please enter your full name or turn on anonymous mode.");
      return;
    }
    if (!selectedArea) {
      toast.error("Please choose the exact area for your feedback.");
      return;
    }
    if (!rating) {
      toast.error("Please choose how your experience felt.");
      return;
    }
    if ((priority === "High" || priority === "Critical") && !comment.trim()) {
      toast.error("Please add a short description for high or critical feedback.");
      return;
    }

    setSaving(true);
    window.setTimeout(() => {
      const record = submitFeedback({
        fullName: anonymous ? "Anonymous" : fullName.trim(),
        contact: contact.trim() || undefined,
        roleType: normalizeRole(roleType),
        siteName,
        locationId: selectedArea.id,
        locationName: selectedArea.name,
        floor: selectedArea.floor ?? (selectedArea.locationScope === "department-service" ? "All floors" : "Site-wide"),
        account: selectedArea.account,
        category,
        subcategory,
        rating,
        priority,
        comment: comment.trim() || undefined,
        source: "Web",
        isAnonymous: anonymous,
        areaType: selectedAreaType.label,
        locationScope: selectedArea.locationScope,
      });
      const caseTicket = useFeedbackStore.getState().tickets.find((ticket) => ticket.feedbackId === record.id);
      setSubmitted({ feedbackId: record.id, caseId: caseTicket?.id, status: record.status });
      setComment("");
      setRating(null);
      setSaving(false);
    }, 250);
  };

  return (
    <>
      <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
        <div className="space-y-6">
          <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="echo-glass p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <SectionTitle eyebrow="About you" title="Who is sharing feedback?" helper="You can share your name or keep the response anonymous." />
              <label className="flex w-fit items-center gap-3 rounded-full border border-cyan-300/15 bg-white/[0.04] px-3 py-2 text-xs font-bold text-slate-200">
                <input checked={anonymous} onChange={(event) => setAnonymous(event.target.checked)} type="checkbox" className="accent-cyan-300" />
                Anonymous
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <FieldLabel label="Full Name">
                <input value={fullName} onChange={(event) => setFullName(event.target.value)} disabled={anonymous} className={`${inputClass} w-full`} placeholder={anonymous ? "Anonymous response" : "Enter your name"} />
              </FieldLabel>
              <FieldLabel label="Contact / Email optional">
                <input value={contact} onChange={(event) => setContact(event.target.value)} className={`${inputClass} w-full`} placeholder="Email or contact number" />
              </FieldLabel>
              <CustomSelect className="md:col-span-2" label="I am a:" value={roleType} onChange={(value) => setRoleType(value as RoleType)} options={[...roleTypes]} />
            </div>
          </motion.section>

          <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }} className="echo-glass p-6">
            <SectionTitle eyebrow="Where did this happen?" title="Choose the site and area" helper="Start broad, then choose the exact place or service." />
            <div className="grid gap-4 md:grid-cols-2">
              <CustomSelect label="Site" value={siteName} onChange={(value) => updateSite(value as SiteName)} options={Object.keys(siteAccounts)} />
              <div className="rounded-2xl border border-cyan-300/10 bg-white/[0.03] p-4 text-sm text-slate-300">
                <span className="block text-xs font-bold uppercase tracking-[0.16em] text-cyan-100/70">Selected site</span>
                <span className="mt-2 block text-lg font-extrabold text-white">{siteName}</span>
              </div>
            </div>

            <div className="mt-7">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-cyan-100/70">What area are you giving feedback about?</p>
              <div className="grid gap-3 md:grid-cols-2">
                {areaTypeOptions.map((option) => {
                  const available = exactAreas[siteName][option.value].length > 0;
                  const selected = areaType === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      disabled={!available}
                      onClick={() => updateAreaType(option.value)}
                      className={cn(
                        "min-h-32 rounded-2xl border p-4 text-left transition",
                        selected ? "border-cyan-200 bg-cyan-300/15 shadow-[0_0_30px_rgba(0,242,254,0.16)]" : "border-cyan-300/15 bg-white/[0.035] hover:border-cyan-300/40 hover:bg-cyan-300/10",
                        !available && "cursor-not-allowed opacity-45 hover:border-cyan-300/15 hover:bg-white/[0.035]",
                      )}
                    >
                      <span className="block text-sm font-extrabold text-white">{option.label}</span>
                      <span className="mt-2 block text-sm leading-6 text-slate-400">{available ? option.description : "No exact areas configured for this site."}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6">
              <CustomSelect
                label={areaType === "production-account-area" ? "Account / Production Area" : "Select Exact Area"}
                value={selectedArea?.id}
                onChange={setExactAreaId}
                disabled={!currentAreaOptions.length}
                placeholder="Choose exact area"
                options={currentAreaOptions.map((item) => ({ value: item.id, label: item.name, helper: item.description }))}
              />
            </div>
          </motion.section>

          <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="echo-glass p-6">
            <SectionTitle eyebrow="Feedback type" title="What kind of feedback is this?" />
            <div className="grid gap-4 md:grid-cols-2">
              <CustomSelect label="Feedback Category" value={category} onChange={(value) => updateCategory(value as FeedbackCategory)} options={Object.keys(feedbackCategories)} />
              <CustomSelect label="Subcategory" value={subcategory} onChange={setSubcategory} options={[...subcategories]} />
            </div>
          </motion.section>

          <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="echo-glass p-6">
            <SectionTitle eyebrow="Tell us what happened" title="Add details" helper="A short description helps the right team understand what needs attention." />
            <div className="grid gap-4 md:grid-cols-[minmax(0,0.45fr)_minmax(0,0.55fr)]">
              <CustomSelect label="Priority" value={priority} onChange={(value) => setPriority(value as (typeof priorityLevels)[number])} options={[...priorityLevels]} />
              <div>
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-cyan-100/70">Attachment</span>
                <button type="button" className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-cyan-300/25 bg-white/[0.03] text-sm font-bold text-cyan-100/80">
                  <Paperclip className="size-4" /> Attachment placeholder
                </button>
              </div>
            </div>
            <div className="mt-4">
              <FieldLabel label="Description / Comment">
                <textarea value={comment} onChange={(event) => setComment(event.target.value)} className={textAreaClass} placeholder="Share what happened, where it happened, and what would help." />
              </FieldLabel>
            </div>
          </motion.section>
        </div>

        <motion.aside initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="xl:sticky xl:top-6 xl:self-start">
          <section className="echo-glass p-6">
            <SectionTitle eyebrow="How was your experience?" title="Choose a smiley" helper="Pick the face that best matches your experience." />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 xl:grid-cols-1 2xl:grid-cols-1">
              {ratings.map((item) => (
                <motion.button
                  key={item.value}
                  type="button"
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setRating(item.value)}
                  className={cn(
                    "flex min-h-28 flex-col items-center justify-center rounded-[1.4rem] border p-4 text-center transition xl:min-h-24 xl:flex-row xl:justify-start xl:text-left",
                    rating === item.value ? "border-cyan-200 bg-cyan-300/15 shadow-[0_0_32px_rgba(0,242,254,0.25)]" : "border-white/10 bg-white/[0.04] hover:border-cyan-300/35",
                  )}
                >
                  <span className={`grid size-16 shrink-0 place-items-center rounded-full bg-gradient-to-br ${item.color} text-4xl shadow-lg hover-wiggle`}>{item.emoji}</span>
                  <span className="mt-3 block text-xs font-extrabold uppercase tracking-wide text-slate-100 xl:ml-4 xl:mt-0">{item.label}</span>
                </motion.button>
              ))}
            </div>
            <motion.button type="submit" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }} disabled={saving} className="sticky bottom-3 z-30 mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-300 to-emerald-300 px-6 py-4 text-sm font-extrabold text-[#031017] shadow-[0_0_35px_rgba(0,242,254,0.24)] transition hover:shadow-[0_0_46px_rgba(0,242,254,0.34)] disabled:cursor-wait disabled:opacity-75 xl:static">
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} {saving ? "Saving feedback..." : "Submit Feedback"}
            </motion.button>
          </section>
        </motion.aside>
      </form>
      <SuccessModal submission={submitted} onClose={() => setSubmitted(null)} />
    </>
  );
}
