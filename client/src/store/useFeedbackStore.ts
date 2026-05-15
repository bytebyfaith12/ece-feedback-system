import { create } from "zustand";
import toast from "react-hot-toast";
import type { Alert, FeedbackResponse, KioskDevice, Location, LocationScope, Report, Site, Ticket, User } from "@/types/index";
import { mockDevices } from "@/data/mockDevices";
import { mockFeedback } from "@/data/mockFeedback";
import { mockInsights } from "@/data/mockInsights";
import { mockLocations, mockSites } from "@/data/mockLocations";
import { mockUsers } from "@/data/mockUsers";
import type { ProductionFeedbackInput, ProductionFeedbackRecord, ProductionFeedbackStatus } from "@/types/feedback";
import { createProductionFeedback, isProductionDatabaseConfigured, listProductionFeedback, productionRecordToFeedbackResponse, productionRecordsToFeedback, updateProductionFeedbackStatus } from "@/lib/feedbackRepository";
import { getCurrentAdmin, signInAdmin, signOutAdmin } from "@/lib/authRepository";

export interface EchoUser {
  id: string;
  name: string;
  email: string;
  role: string;
  loginTime: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  module: string;
  details: string;
}

interface SubmitFeedbackInput {
  fullName: string;
  contact?: string;
  roleType: FeedbackResponse["respondentType"] | "it" | "admin" | "client";
  siteName: string;
  locationId?: string;
  locationName?: string;
  floor: string;
  account?: string;
  areaType?: string;
  locationScope?: LocationScope;
  category: string;
  subcategory?: string;
  rating: FeedbackResponse["rating"];
  priority: "Low" | "Medium" | "High" | "Critical";
  comment?: string;
  source?: FeedbackResponse["source"];
  isAnonymous?: boolean;
}

interface PulseStore {
  feedback: FeedbackResponse[];
  locations: Location[];
  sites: Site[];
  devices: KioskDevice[];
  alerts: Alert[];
  tickets: Ticket[];
  reports: Report[];
  users: User[];
  insights: typeof mockInsights;
  auditLogs: AuditLog[];
  sidebarCollapsed: boolean;
  authenticated: boolean;
  user: EchoUser | null;
  remoteStatus: "idle" | "loading" | "ready" | "error";
  remoteError?: string;
  addFeedback: (feedback: FeedbackResponse) => void;
  submitFeedback: (input: SubmitFeedbackInput) => FeedbackResponse;
  submitProductionFeedback: (input: ProductionFeedbackInput, attachment?: File | null) => Promise<ProductionFeedbackRecord>;
  syncFeedback: () => Promise<void>;
  updateProductionFeedbackStatus: (id: string, status: ProductionFeedbackStatus, adminNotes?: string) => Promise<void>;
  addGeneratedFeedback: () => void;
  updateAlertStatus: (id: string, status: Alert["status"]) => void;
  updateTicketStatus: (id: string, status: Ticket["status"]) => void;
  addReport: (title: string, type: Report["type"]) => void;
  loadDemoData: () => void;
  toggleSidebar: () => void;
  bootstrapAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role?: string) => void;
  logout: () => Promise<void>;
  addAudit: (action: string, module: string, details: string, user?: string) => void;
}

const STORAGE_KEY = "ece-echo-command-state-v1";

type PersistedState = Pick<PulseStore, "feedback" | "alerts" | "tickets" | "reports" | "auditLogs" | "authenticated" | "user">;

function readStored(): Partial<PersistedState> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function persist(state: Partial<PulseStore>) {
  if (typeof window === "undefined") return;
  const remoteConfigured = isProductionDatabaseConfigured();
  const persisted: PersistedState = {
    feedback: remoteConfigured ? [] : state.feedback ?? [],
    alerts: remoteConfigured ? [] : state.alerts ?? [],
    tickets: remoteConfigured ? [] : state.tickets ?? [],
    reports: state.reports ?? [],
    auditLogs: state.auditLogs ?? [],
    authenticated: state.authenticated ?? false,
    user: state.user ?? null,
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
}

function audit(action: string, module: string, details: string, user = "System"): AuditLog {
  return { id: `AUD-${Date.now()}-${Math.random().toString(16).slice(2)}`, timestamp: new Date().toISOString(), user, action, module, details };
}

function assignedTeamFor(category: string) {
  if (category.includes("IT")) return "IT";
  if (category.includes("Facilities")) return "Facilities";
  if (category.includes("Security")) return "Security";
  if (category.includes("Recruitment")) return "Recruitment";
  if (category.includes("Visitor")) return "Operations";
  if (category.includes("Payroll")) return "Payroll";
  if (category.includes("HR") || category.includes("Employee")) return "HR";
  return "Admin";
}

function findLocation(siteName: string, floor: string, category: string, locationId?: string) {
  return (
    mockLocations.find((item) => item.id === locationId) ??
    mockLocations.find((item) => item.siteName === siteName && item.floor === floor && item.category === category) ??
    mockLocations.find((item) => item.siteName === siteName && item.floor === floor) ??
    mockLocations.find((item) => item.siteName === siteName) ??
    mockLocations[0]
  );
}

function createAlertFromFeedback(feedback: FeedbackResponse): Alert {
  const isCritical = feedback.priority === "Critical" || feedback.rating === 1;
  return {
    id: `ALT-${Date.now()}`,
    type: isCritical ? "consecutive-negative" : "low-satisfaction",
    priority: isCritical ? "critical" : "high",
    title: isCritical ? "Critical feedback requires action" : "Negative feedback needs review",
    description: `${feedback.locationName} received ${feedback.rating <= 1 ? "very unhappy" : "unhappy"} feedback.`,
    locationId: feedback.locationId,
    locationName: feedback.locationName,
    siteId: feedback.siteId,
    deviceId: feedback.deviceId,
    status: "new",
    triggeredAt: new Date().toISOString(),
    triggerValue: feedback.rating,
    thresholdValue: 3,
    autoCreatedTicket: true,
  };
}

function createTicketFromFeedback(feedback: FeedbackResponse, alertId?: string): Ticket {
  const priority = feedback.priority === "Critical" ? "critical" : feedback.priority === "High" || feedback.rating <= 2 ? "high" : "medium";
  return {
    id: `TK-${Date.now()}`,
    feedbackId: feedback.id,
    alertId,
    title: `${feedback.assignedTeam ?? assignedTeamFor(feedback.category)} follow-up: ${feedback.locationName}`,
    description: feedback.comment || "Action required from submitted feedback.",
    category: feedback.assignedTeam as Ticket["category"],
    priority,
    status: "new",
    locationId: feedback.locationId,
    locationName: feedback.locationName,
    siteId: feedback.siteId,
    department: feedback.assignedTeam ?? assignedTeamFor(feedback.category),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    slaDeadline: new Date(Date.now() + 4 * 3600000).toISOString(),
    slaBreached: false,
    notes: [{ id: `note-${Date.now()}`, author: "ECE Echo", content: "Case created from feedback submission.", createdAt: new Date().toISOString(), isInternal: false }],
  };
}

function deriveActionItems(feedback: FeedbackResponse[]) {
  const alerts: Alert[] = [];
  const tickets: Ticket[] = [];
  feedback.forEach((item) => {
    const actionable = item.rating <= 2 || item.priority === "High" || item.priority === "Critical";
    if (!actionable) return;
    const alert = { ...createAlertFromFeedback(item), id: `ALT-${item.id}`, triggeredAt: item.submittedAt };
    const ticket = { ...createTicketFromFeedback(item, alert.id), id: `TK-${item.id}`, createdAt: item.submittedAt, updatedAt: item.updatedAt ?? item.submittedAt };
    alerts.push(alert);
    tickets.push(ticket);
  });
  return { alerts, tickets };
}

const stored = readStored();

export const useFeedbackStore = create<PulseStore>((set, get) => ({
  feedback: stored.feedback ?? [],
  locations: mockLocations,
  sites: mockSites,
  devices: mockDevices.map((device) => ({ ...device, feedbackToday: 0 })),
  alerts: stored.alerts ?? [],
  tickets: stored.tickets ?? [],
  reports: stored.reports ?? [],
  users: mockUsers,
  insights: mockInsights,
  auditLogs: stored.auditLogs ?? [],
  sidebarCollapsed: false,
  authenticated: stored.authenticated ?? false,
  user: stored.user ?? null,
  remoteStatus: "idle",
  remoteError: undefined,
  addFeedback: (feedback) =>
    set((state) => {
      const actionable = feedback.rating <= 2 || feedback.priority === "High" || feedback.priority === "Critical";
      const alert = actionable ? createAlertFromFeedback(feedback) : null;
      const ticket = alert ? createTicketFromFeedback(feedback, alert.id) : null;
      const next = {
        ...state,
        feedback: [feedback, ...state.feedback],
        alerts: alert ? [alert, ...state.alerts] : state.alerts,
        tickets: ticket ? [ticket, ...state.tickets] : state.tickets,
        auditLogs: [audit("Submitted feedback", "Feedback", `${feedback.id} submitted for ${feedback.locationName}.`, feedback.fullName ?? state.user?.email ?? "Anonymous"), ...state.auditLogs],
      };
      persist(next);
      toast.success("Feedback submitted successfully.");
      return next;
    }),
  submitFeedback: (input) => {
    const location = findLocation(input.siteName, input.floor, input.category, input.locationId);
    const now = new Date().toISOString();
    const feedback: FeedbackResponse = {
      id: `FB-${Date.now()}`,
      locationId: input.locationId ?? location.id,
      locationName: input.locationName ?? location.name,
      site: input.siteName,
      siteId: location.siteId,
      siteName: input.siteName,
      fullName: input.fullName,
      contact: input.contact,
      floor: input.floor,
      account: input.account,
      areaType: input.areaType,
      locationScope: input.locationScope ?? location.scope,
      category: input.category,
      subcategory: input.subcategory,
      rating: input.rating,
      priority: input.priority,
      status: input.rating <= 2 || input.priority === "High" || input.priority === "Critical" ? "New" : "Reviewed",
      assignedTeam: assignedTeamFor(input.category),
      source: input.source ?? "Web",
      comment: input.comment,
      isAnonymous: input.isAnonymous ?? false,
      respondentType: ["customer", "employee", "visitor", "applicant"].includes(input.roleType) ? (input.roleType as FeedbackResponse["respondentType"]) : "employee",
      language: "EN",
      deviceId: input.source === "QR" ? "QR-MOBILE" : location.kioskIds[0] ?? "WEB-FORM",
      submittedAt: now,
      sessionDuration: 12,
    };
    get().addFeedback(feedback);
    return feedback;
  },
  submitProductionFeedback: async (input, attachment) => {
    const record = await createProductionFeedback(input, attachment);
    const feedback = productionRecordToFeedbackResponse(record);
    set((state) => {
      const actionable = feedback.rating <= 2 || feedback.priority === "High" || feedback.priority === "Critical";
      const alert = actionable ? createAlertFromFeedback(feedback) : null;
      const ticket = alert ? createTicketFromFeedback(feedback, alert.id) : null;
      const next = {
        ...state,
        feedback: [feedback, ...state.feedback.filter((item) => item.id !== feedback.id)],
        alerts: alert ? [alert, ...state.alerts] : state.alerts,
        tickets: ticket ? [ticket, ...state.tickets] : state.tickets,
        auditLogs: [audit("Submitted feedback", "Feedback", `${feedback.id} submitted for ${feedback.locationName}.`, feedback.fullName ?? "Anonymous"), ...state.auditLogs],
        remoteStatus: "ready" as const,
        remoteError: undefined,
      };
      persist(next);
      return next;
    });
    return record;
  },
  syncFeedback: async () => {
    set({ remoteStatus: "loading", remoteError: undefined });
    try {
      const records = await listProductionFeedback();
      const feedback = productionRecordsToFeedback(records);
      const { alerts, tickets } = deriveActionItems(feedback);
      set((state) => ({ ...state, feedback, alerts, tickets, remoteStatus: "ready", remoteError: undefined }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not load feedback.";
      set({ remoteStatus: "error", remoteError: message });
    }
  },
  updateProductionFeedbackStatus: async (id, status, adminNotes = "") => {
    const record = await updateProductionFeedbackStatus(id, status, adminNotes);
    if (!record) return;
    const feedback = productionRecordToFeedbackResponse(record);
    set((state) => {
      const nextFeedback = state.feedback.map((item) => (item.id === feedback.id || item.submissionId === feedback.submissionId ? feedback : item));
      const next = { ...state, feedback: nextFeedback, auditLogs: [audit("Feedback updated", "Admin", `${feedback.id} moved to ${status}.`, state.user?.email ?? "Admin"), ...state.auditLogs] };
      persist(next);
      return next;
    });
  },
  addGeneratedFeedback: () => undefined,
  updateAlertStatus: (id, status) =>
    set((state) => {
      const next = { ...state, alerts: state.alerts.map((alert) => (alert.id === id ? { ...alert, status } : alert)), auditLogs: [audit("Alert updated", "Alerts", `${id} moved to ${status}.`, state.user?.email ?? "Current User"), ...state.auditLogs] };
      persist(next);
      toast.success("Alert updated.");
      return next;
    }),
  updateTicketStatus: (id, status) =>
    set((state) => {
      const next = { ...state, tickets: state.tickets.map((ticket) => (ticket.id === id ? { ...ticket, status, updatedAt: new Date().toISOString() } : ticket)), auditLogs: [audit("Ticket updated", "Tickets", `${id} moved to ${status}.`, state.user?.email ?? "Current User"), ...state.auditLogs] };
      persist(next);
      toast.success("Ticket updated.");
      return next;
    }),
  addReport: (title, type) =>
    set((state) => {
      const report: Report = {
        id: `RPT-${Date.now()}`,
        title,
        type,
        generatedBy: state.user?.email ?? "Current User",
        generatedAt: new Date().toISOString(),
        dateRange: { from: new Date(Date.now() - 7 * 86400000).toISOString(), to: new Date().toISOString() },
        filters: { sites: ["All"] },
        status: "ready",
        fileUrl: "#",
        fileSize: 0,
      };
      const next = { ...state, reports: [report, ...state.reports], auditLogs: [audit("Report generated", "Reports", `${title} generated.`, state.user?.email ?? "Current User"), ...state.auditLogs] };
      persist(next);
      toast.success("Report generated.");
      return next;
    }),
  loadDemoData: () =>
    set((state) => {
      const demoFeedback = mockFeedback.slice(0, 80);
      const next = { ...state, feedback: demoFeedback, auditLogs: [audit("Loaded demo data", "Admin", "Demo data loaded manually for testing.", state.user?.email ?? "Admin"), ...state.auditLogs] };
      persist(next);
      toast.success("Demo data loaded for testing.");
      return next;
    }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  bootstrapAuth: async () => {
    if (!isProductionDatabaseConfigured()) return;
    const user = await getCurrentAdmin();
    set((state) => {
      const next = { ...state, authenticated: Boolean(user), user };
      persist(next);
      return next;
    });
  },
  login: async (email, password) => {
    const user = await signInAdmin(email, password);
    set((state) => {
      const next = { ...state, authenticated: true, user, auditLogs: [audit("Login", "Authentication", "User logged in.", email), ...state.auditLogs] };
      persist(next);
      toast.success("Login successful.");
      return next;
    });
  },
  signup: (name, email, password) =>
    set((state) => {
      void password;
      const user = { id: `user-${Date.now()}`, name, email, role: "Viewer", loginTime: new Date().toISOString() };
      const next = { ...state, authenticated: true, user, auditLogs: [audit("Signup", "Authentication", `${name} created an account.`, email), ...state.auditLogs] };
      persist(next);
      toast.success("Signup successful.");
      return next;
    }),
  logout: async () => {
    await signOutAdmin();
    set((state) => {
      const next = { ...state, authenticated: false, user: null, auditLogs: [audit("Logout", "Authentication", "User logged out.", state.user?.email ?? "Current User"), ...state.auditLogs] };
      persist(next);
      toast.success("Logged out.");
      return next;
    });
  },
  addAudit: (action, module, details, user) =>
    set((state) => {
      const next = { ...state, auditLogs: [audit(action, module, details, user ?? state.user?.email ?? "System"), ...state.auditLogs] };
      persist(next);
      return next;
    }),
}));
