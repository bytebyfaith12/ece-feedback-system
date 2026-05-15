import type { DashboardCharts, FeedbackRecord, MetaData, Summary, User } from "@/types";

const API_BASE = import.meta.env.VITE_API_BASE || "";

function authHeaders() {
  const token = localStorage.getItem("ece-pulse-token") || localStorage.getItem("ecePulseToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  Object.entries(authHeaders()).forEach(([key, value]) => headers.set(key, value));

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed." }));
    throw new Error(error.message || "Request failed.");
  }

  return response.json();
}

export const api = {
  meta: () => request<{ data: MetaData }>("/api/meta"),
  signup: (payload: Record<string, unknown>) =>
    request<{ user: User; token: string }>("/api/auth/signup", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload: Record<string, unknown>) =>
    request<{ user: User; token: string }>("/api/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  me: () => request<{ user: User }>("/api/auth/me"),
  submitFeedback: (payload: FormData) =>
    request<{ message: string; data: FeedbackRecord }>("/api/feedback", { method: "POST", body: payload }),
  feedback: (query = "") => request<{ data: FeedbackRecord[] }>(`/api/feedback${query}`),
  updateFeedback: (id: string, payload: Record<string, unknown>) =>
    request<{ data: FeedbackRecord }>(`/api/feedback/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  archiveFeedback: (id: string) => request<{ data: FeedbackRecord }>(`/api/feedback/${id}`, { method: "DELETE" }),
  dashboardSummary: () => request<{ data: Summary }>("/api/dashboard/summary"),
  dashboardCharts: () => request<{ data: DashboardCharts }>("/api/dashboard/charts"),
  dashboardRecent: () => request<{ data: FeedbackRecord[] }>("/api/dashboard/recent"),
  reportSummary: (query = "") => request<{ data: Summary & Record<string, unknown>; records: FeedbackRecord[] }>(`/api/reports/summary${query}`),
  users: () => request<{ data: User[] }>("/api/admin/users"),
  updateUser: (id: string, payload: Record<string, unknown>) =>
    request<{ data: User }>(`/api/admin/users/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  auditLogs: () => request<{ data: Array<Record<string, unknown>> }>("/api/admin/audit-logs"),
};

export function downloadUrl(path: string) {
  const token = localStorage.getItem("ece-pulse-token") || localStorage.getItem("ecePulseToken");
  return `${API_BASE}${path}${path.includes("?") ? "&" : "?"}token=${encodeURIComponent(token || "")}`;
}
