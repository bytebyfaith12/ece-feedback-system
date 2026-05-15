import { create } from "zustand";
import { allAccounts, appRoles, feedbackCategoryGroups, priorities, ratingOptions, siteAccounts, statuses } from "@/data/commandCenterData";

export type SiteName = "Noel" | "Macias" | "Consuelo";
export type Priority = (typeof priorities)[number];
export type CaseStatus = (typeof statuses)[number];
export type RatingLabel = (typeof ratingOptions)[number]["label"];
export type AppRole = (typeof appRoles)[number];

export interface AccountRecord {
  id: string;
  name: string;
  site: string;
  enabled: boolean;
}

export interface TimelineItem {
  at: string;
  label: string;
  detail: string;
}

export interface FeedbackRecord {
  id: string;
  caseId: string;
  fullName: string;
  contact?: string;
  roleType: string;
  site: SiteName;
  floor: string;
  account: string;
  category: string;
  subcategory: string;
  rating: RatingLabel;
  ratingScore: number;
  priority: Priority;
  description: string;
  attachmentName?: string;
  status: CaseStatus;
  assignedTeam: string;
  assignedOwner: string;
  createdAt: string;
  updatedAt: string;
  timeline: TimelineItem[];
  internalNotes: string[];
  escalationHistory: string[];
  resolutionNotes: string;
}

export interface AlertRecord {
  id: string;
  caseId: string;
  title: string;
  priority: Priority;
  status: CaseStatus;
  site: SiteName;
  account: string;
  category: string;
  createdAt: string;
  details: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  module: string;
  details: string;
  severity: "Info" | "Warning" | "Critical";
}

export interface ReportHistory {
  id: string;
  type: string;
  createdAt: string;
  filters: string;
}

export interface UserRecord {
  id: string;
  fullName: string;
  email: string;
  role: AppRole;
  siteAccess: string[];
  accountAccess: string[];
  status: "Active" | "Disabled";
}

interface SubmitInput {
  fullName: string;
  contact?: string;
  roleType: string;
  site: SiteName;
  floor: string;
  account: string;
  category: string;
  subcategory: string;
  rating: RatingLabel;
  ratingScore: number;
  priority: Priority;
  description: string;
  attachmentName?: string;
}

interface StoreState {
  feedback: FeedbackRecord[];
  alerts: AlertRecord[];
  auditLogs: AuditLog[];
  reportHistory: ReportHistory[];
  accounts: AccountRecord[];
  users: UserRecord[];
  currentRole: AppRole;
  submitFeedback: (input: SubmitInput) => FeedbackRecord;
  updateCaseStatus: (id: string, status: CaseStatus, note?: string) => void;
  addCaseNote: (id: string, note: string) => void;
  exportReport: (type: string, filters: string) => void;
  addAccount: (name: string, site: string) => void;
  updateAccount: (id: string, patch: Partial<AccountRecord>) => void;
  addUser: (user: Omit<UserRecord, "id">) => void;
  updateUser: (id: string, patch: Partial<UserRecord>) => void;
  addAudit: (log: Omit<AuditLog, "id" | "timestamp">) => void;
  setCurrentRole: (role: AppRole) => void;
}

const STORAGE_KEY = "ece-pulse-command-state-v2";

const defaultUsers: UserRecord[] = [
  { id: "user-admin", fullName: "ECE Admin", email: "admin@ecepulse.local", role: "Admin", siteAccess: ["Noel", "Macias", "Consuelo"], accountAccess: ["All"], status: "Active" },
  { id: "user-it", fullName: "IT Command", email: "it@ecepulse.local", role: "IT", siteAccess: ["Noel", "Macias", "Consuelo"], accountAccess: ["IT"], status: "Active" },
  { id: "user-manager", fullName: "Operations Manager", email: "manager@ecepulse.local", role: "Manager", siteAccess: ["Noel"], accountAccess: siteAccounts.Noel.slice(0, 4), status: "Active" },
];

function assignedTeamFor(category: string) {
  return feedbackCategoryGroups.find((group) => group.group === category)?.assignedTeam ?? "Admin";
}

function isActionable(input: SubmitInput) {
  return input.priority === "High" || input.priority === "Critical" || input.ratingScore <= 2;
}

function readStored(): Partial<StoreState> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function persist(state: Pick<StoreState, "feedback" | "alerts" | "auditLogs" | "reportHistory" | "accounts" | "users" | "currentRole">) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function logEntry(action: string, module: string, details: string, severity: AuditLog["severity"] = "Info"): AuditLog {
  return {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    user: "Current User",
    action,
    module,
    details,
    severity,
  };
}

const stored = readStored();

export const useCommandCenter = create<StoreState>((set) => ({
  feedback: stored.feedback ?? [],
  alerts: stored.alerts ?? [],
  auditLogs: stored.auditLogs ?? [],
  reportHistory: stored.reportHistory ?? [],
  accounts: stored.accounts ?? allAccounts,
  users: stored.users ?? defaultUsers,
  currentRole: stored.currentRole ?? "Admin",
  submitFeedback: (input) => {
    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    const actionable = isActionable(input);
    const record: FeedbackRecord = {
      id,
      caseId: `ECE-${String(Date.now()).slice(-7)}`,
      ...input,
      status: actionable ? "New" : "Reviewed",
      assignedTeam: assignedTeamFor(input.category),
      assignedOwner: actionable ? `${assignedTeamFor(input.category)} Queue` : "No action needed",
      createdAt: now,
      updatedAt: now,
      timeline: [
        { at: now, label: "Feedback submitted", detail: `${input.rating} feedback received for ${input.subcategory}.` },
        ...(actionable ? [{ at: now, label: "Case created", detail: "Feedback requires review based on rating or priority." }] : []),
      ],
      internalNotes: [],
      escalationHistory: actionable && input.priority === "Critical" ? ["Auto-escalated because priority is Critical."] : [],
      resolutionNotes: "",
    };

    const alert: AlertRecord | null = actionable
      ? {
          id: crypto.randomUUID(),
          caseId: record.caseId,
          title: `${input.priority} ${input.subcategory}`,
          priority: input.priority,
          status: "New",
          site: input.site,
          account: input.account,
          category: input.category,
          createdAt: now,
          details: input.description || `${input.subcategory} submitted from ${input.floor}.`,
        }
      : null;

    set((state) => {
      const next = {
        feedback: [record, ...state.feedback],
        alerts: alert ? [alert, ...state.alerts] : state.alerts,
        auditLogs: [logEntry("Submitted feedback", "Feedback", `${record.caseId} submitted by ${input.fullName}.`, actionable ? "Warning" : "Info"), ...state.auditLogs],
        reportHistory: state.reportHistory,
        accounts: state.accounts,
        users: state.users,
        currentRole: state.currentRole,
      };
      persist(next);
      return next;
    });

    return record;
  },
  updateCaseStatus: (id, status, note) =>
    set((state) => {
      const now = new Date().toISOString();
      const feedback = state.feedback.map((item) =>
        item.id === id || item.caseId === id
          ? {
              ...item,
              status,
              updatedAt: now,
              timeline: [{ at: now, label: `Status changed to ${status}`, detail: note || "Case status updated." }, ...item.timeline],
            }
          : item,
      );
      const alerts = state.alerts.map((alert) => (alert.caseId === id ? { ...alert, status } : alert));
      const next = {
        feedback,
        alerts,
        auditLogs: [logEntry("Status changed", "Case Management", `${id} moved to ${status}.`, status === "Escalated" ? "Critical" : "Info"), ...state.auditLogs],
        reportHistory: state.reportHistory,
        accounts: state.accounts,
        users: state.users,
        currentRole: state.currentRole,
      };
      persist(next);
      return next;
    }),
  addCaseNote: (id, note) =>
    set((state) => {
      const feedback = state.feedback.map((item) => (item.id === id || item.caseId === id ? { ...item, internalNotes: [note, ...item.internalNotes] } : item));
      const next = {
        feedback,
        alerts: state.alerts,
        auditLogs: [logEntry("Added note", "Case Management", `Internal note added to ${id}.`), ...state.auditLogs],
        reportHistory: state.reportHistory,
        accounts: state.accounts,
        users: state.users,
        currentRole: state.currentRole,
      };
      persist(next);
      return next;
    }),
  exportReport: (type, filters) =>
    set((state) => {
      const report = { id: crypto.randomUUID(), type, createdAt: new Date().toISOString(), filters };
      const next = {
        feedback: state.feedback,
        alerts: state.alerts,
        auditLogs: [logEntry("Report exported", "Reports", `${type} export simulated. Filters: ${filters}.`), ...state.auditLogs],
        reportHistory: [report, ...state.reportHistory],
        accounts: state.accounts,
        users: state.users,
        currentRole: state.currentRole,
      };
      persist(next);
      return next;
    }),
  addAccount: (name, site) =>
    set((state) => {
      const account = { id: `${site}-${name}-${Date.now()}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"), name, site, enabled: true };
      const next = {
        feedback: state.feedback,
        alerts: state.alerts,
        auditLogs: [logEntry("Account added", "Admin Settings", `${name} added to ${site}.`), ...state.auditLogs],
        reportHistory: state.reportHistory,
        accounts: [account, ...state.accounts],
        users: state.users,
        currentRole: state.currentRole,
      };
      persist(next);
      return next;
    }),
  updateAccount: (id, patch) =>
    set((state) => {
      const accounts = state.accounts.map((item) => (item.id === id ? { ...item, ...patch } : item));
      const next = {
        feedback: state.feedback,
        alerts: state.alerts,
        auditLogs: [logEntry("Account updated", "Admin Settings", `${id} account settings changed.`), ...state.auditLogs],
        reportHistory: state.reportHistory,
        accounts,
        users: state.users,
        currentRole: state.currentRole,
      };
      persist(next);
      return next;
    }),
  addUser: (user) =>
    set((state) => {
      const users = [{ ...user, id: crypto.randomUUID() }, ...state.users];
      const next = {
        feedback: state.feedback,
        alerts: state.alerts,
        auditLogs: [logEntry("User added", "User Management", `${user.fullName} added as ${user.role}.`), ...state.auditLogs],
        reportHistory: state.reportHistory,
        accounts: state.accounts,
        users,
        currentRole: state.currentRole,
      };
      persist(next);
      return next;
    }),
  updateUser: (id, patch) =>
    set((state) => {
      const users = state.users.map((item) => (item.id === id ? { ...item, ...patch } : item));
      const next = {
        feedback: state.feedback,
        alerts: state.alerts,
        auditLogs: [logEntry("Role/access updated", "User Management", `${id} permissions changed.`, "Warning"), ...state.auditLogs],
        reportHistory: state.reportHistory,
        accounts: state.accounts,
        users,
        currentRole: state.currentRole,
      };
      persist(next);
      return next;
    }),
  addAudit: (log) =>
    set((state) => {
      const next = {
        feedback: state.feedback,
        alerts: state.alerts,
        auditLogs: [{ id: crypto.randomUUID(), timestamp: new Date().toISOString(), ...log }, ...state.auditLogs],
        reportHistory: state.reportHistory,
        accounts: state.accounts,
        users: state.users,
        currentRole: state.currentRole,
      };
      persist(next);
      return next;
    }),
  setCurrentRole: (role) =>
    set((state) => {
      const next = { ...state, currentRole: role };
      persist(next);
      return { currentRole: role };
    }),
}));

export function getSummary(feedback: FeedbackRecord[], alerts: AlertRecord[]) {
  const total = feedback.length;
  const satisfied = feedback.filter((item) => item.ratingScore >= 4).length;
  const resolved = feedback.filter((item) => ["Resolved", "Closed"].includes(item.status)).length;
  const urgent = feedback.filter((item) => item.priority === "High" || item.priority === "Critical").length;
  const averageRating = total ? feedback.reduce((sum, item) => sum + item.ratingScore, 0) / total : 0;
  const openAlerts = alerts.filter((alert) => !["Resolved", "Closed", "Declined"].includes(alert.status)).length;
  const newCases = feedback.filter((item) => item.status === "New").length;
  const slaWarnings = feedback.filter((item) => ["High", "Critical"].includes(item.priority) && !["Resolved", "Closed"].includes(item.status)).length;

  return {
    total,
    satisfactionScore: total ? Math.round((satisfied / total) * 100) : 0,
    openAlerts,
    resolved,
    urgent,
    averageRating: Number(averageRating.toFixed(1)),
    newCases,
    slaWarnings,
  };
}

export function groupCount<T extends string>(items: FeedbackRecord[], key: (item: FeedbackRecord) => T, buckets: readonly T[]) {
  return buckets.map((bucket) => ({ name: bucket, value: items.filter((item) => key(item) === bucket).length }));
}

export function getAccountsForSite(accounts: AccountRecord[], site: string) {
  return accounts.filter((account) => account.site === site && account.enabled).map((account) => account.name);
}
