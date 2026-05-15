import { create } from "zustand";
import { feedbackCategories, mockAlerts, mockDevices, mockTickets } from "@/data/mockData";
import type { AlertItem, AlertStatus, Department, FeedbackRecord, Rating, Role, TicketItem, TicketStatus } from "@/types";

const STORAGE_KEY = "ece-pulse-feedback-prototype";

interface PersistedPulseState {
  feedback: FeedbackRecord[];
  generatedAlerts: AlertItem[];
  generatedTickets: TicketItem[];
}

export interface FeedbackInput {
  category: string;
  rating: Rating;
  ratingScore: number;
  issues: string[];
  comment?: string;
  fullName?: string;
  employeeOrVisitorId?: string;
  role?: string;
  site: string;
  floor: string;
  accountDepartment: string;
  source?: FeedbackRecord["source"];
  deviceKioskId?: string;
  attachmentUrl?: string;
}

interface PulseState extends PersistedPulseState {
  activeRole: Role;
  submitFeedback: (input: FeedbackInput) => FeedbackRecord;
  updateTicketStatus: (ticketId: string, status: TicketStatus) => void;
  updateAlertStatus: (alertId: string, status: AlertStatus) => void;
  archiveFeedback: (feedbackId: string) => void;
  setActiveRole: (role: Role) => void;
  clearLocalFeedback: () => void;
}

function readPersisted(): PersistedPulseState {
  if (typeof window === "undefined") {
    return { feedback: [], generatedAlerts: [], generatedTickets: [] };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { feedback: [], generatedAlerts: [], generatedTickets: [] };
    const parsed = JSON.parse(raw) as Partial<PersistedPulseState>;
    return {
      feedback: parsed.feedback ?? [],
      generatedAlerts: parsed.generatedAlerts ?? [],
      generatedTickets: parsed.generatedTickets ?? [],
    };
  } catch {
    return { feedback: [], generatedAlerts: [], generatedTickets: [] };
  }
}

function writePersisted(state: PersistedPulseState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getAssignedTeam(category: string): Department {
  if (category.includes("IT") || category.includes("Internet") || category.includes("WiFi")) return "IT";
  if (category.includes("HR")) return "HR";
  if (category.includes("Payroll")) return "Payroll";
  if (category.includes("Security")) return "Security";
  if (category.includes("Recruitment")) return "Recruitment";
  if (category.includes("Training")) return "Training";
  if (category.includes("Restroom") || category.includes("Pantry") || category.includes("AC") || category.includes("Elevator") || category.includes("Smoking")) {
    return "Facilities";
  }
  return "Operations";
}

function getPriority(score: number, category: string) {
  if (score <= 1 || category.includes("Internet")) return "Critical" as const;
  if (score <= 2) return "High" as const;
  return "Medium" as const;
}

function normalizeCategory(category: string) {
  return feedbackCategories.includes(category) ? category : category.replace(/-/g, " ");
}

function createGeneratedAlert(record: FeedbackRecord): AlertItem {
  const priority = getPriority(record.ratingScore, record.category);
  return {
    id: `alert-${record.id}`,
    title: `${priority} ${record.category} feedback`,
    type: record.category.includes("Internet") ? "Internet outage" : "Critical dissatisfaction",
    site: record.site,
    floor: record.floor,
    category: record.category,
    priority,
    status: "New",
    createdAt: record.createdAt,
    assignedTeam: record.assignedTeam,
    description: record.issues.length > 0 ? record.issues.join(", ") : record.comment || "Negative feedback needs review.",
  };
}

function createGeneratedTicket(record: FeedbackRecord): TicketItem {
  const department = record.assignedTeam;
  const priority = getPriority(record.ratingScore, record.category);
  return {
    id: `ticket-${record.id}`,
    ticketId: `ECE-${department.slice(0, 3).toUpperCase()}-${String(Date.now()).slice(-5)}`,
    feedbackId: record.feedbackId,
    category: record.category,
    site: record.site,
    floor: record.floor,
    department,
    priority,
    slaMinutes: priority === "Critical" ? 30 : priority === "High" ? 60 : 120,
    status: "New",
    createdAt: record.createdAt,
    assignedOwner: `${department} Team`,
    summary: record.comment || record.issues.join(", ") || `${record.category} action item from feedback.`,
  };
}

const initialState = readPersisted();

export const usePulseStore = create<PulseState>((set) => ({
  ...initialState,
  activeRole: "Super Admin",
  submitFeedback: (input) => {
    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    const record: FeedbackRecord = {
      id,
      feedbackId: `FB-${String(Date.now()).slice(-8)}`,
      fullName: input.fullName?.trim() || "Anonymous",
      employeeOrVisitorId: input.employeeOrVisitorId?.trim() || "Not provided",
      role: input.role || "Anonymous",
      site: input.site,
      floor: input.floor,
      accountDepartment: input.accountDepartment,
      category: normalizeCategory(input.category),
      rating: input.rating,
      ratingScore: input.ratingScore,
      issues: input.issues,
      comment: input.comment,
      attachmentUrl: input.attachmentUrl,
      deviceKioskId: input.deviceKioskId,
      status: "New",
      assignedTeam: getAssignedTeam(input.category),
      createdAt: now,
      updatedAt: now,
      source: input.source ?? "Web",
    };

    const negative = input.ratingScore <= 3;
    const generatedAlert = negative ? createGeneratedAlert(record) : null;
    const generatedTicket = negative ? createGeneratedTicket(record) : null;

    set((state) => {
      const next: PersistedPulseState = {
        feedback: [record, ...state.feedback],
        generatedAlerts: generatedAlert ? [generatedAlert, ...state.generatedAlerts] : state.generatedAlerts,
        generatedTickets: generatedTicket ? [generatedTicket, ...state.generatedTickets] : state.generatedTickets,
      };
      writePersisted(next);
      return next;
    });

    return record;
  },
  updateTicketStatus: (ticketId, status) =>
    set((state) => {
      const generatedTickets = state.generatedTickets.map((ticket) => (ticket.id === ticketId || ticket.ticketId === ticketId ? { ...ticket, status } : ticket));
      const persisted = { feedback: state.feedback, generatedAlerts: state.generatedAlerts, generatedTickets };
      writePersisted(persisted);
      return { generatedTickets };
    }),
  updateAlertStatus: (alertId, status) =>
    set((state) => {
      const generatedAlerts = state.generatedAlerts.map((alert) => (alert.id === alertId ? { ...alert, status } : alert));
      const persisted = { feedback: state.feedback, generatedAlerts, generatedTickets: state.generatedTickets };
      writePersisted(persisted);
      return { generatedAlerts };
    }),
  archiveFeedback: (feedbackId) =>
    set((state) => {
      const feedback: FeedbackRecord[] = state.feedback.map((record) => (record.id === feedbackId || record.feedbackId === feedbackId ? { ...record, status: "Archived" } : record));
      const persisted: PersistedPulseState = { feedback, generatedAlerts: state.generatedAlerts, generatedTickets: state.generatedTickets };
      writePersisted(persisted);
      return { feedback };
    }),
  setActiveRole: (role) => set({ activeRole: role }),
  clearLocalFeedback: () => {
    const next = { feedback: [], generatedAlerts: [], generatedTickets: [] };
    writePersisted(next);
    set(next);
  },
}));

export function useAllAlerts() {
  return usePulseStore((state) => [...state.generatedAlerts, ...mockAlerts]);
}

export function useAllTickets() {
  return usePulseStore((state) => [...state.generatedTickets, ...mockTickets]);
}

export function useAllDevices() {
  return mockDevices;
}

export function selectFeedbackSummary(feedback: FeedbackRecord[]) {
  const total = feedback.length;
  const satisfied = feedback.filter((item) => item.ratingScore >= 4).length;
  const unsatisfied = feedback.filter((item) => item.ratingScore <= 2).length;
  const open = feedback.filter((item) => ["New", "Reviewed", "In Progress"].includes(item.status)).length;
  return {
    totalFeedback: total,
    satisfactionRate: total ? Math.round((satisfied / total) * 100) : 0,
    unsatisfiedFeedback: unsatisfied,
    openActionItems: open,
  };
}
