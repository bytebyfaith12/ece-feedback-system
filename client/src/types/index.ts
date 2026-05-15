export type SmileyRating = 1 | 2 | 3 | 4 | 5;
export type FeedbackMode = "4button" | "5button";

export interface FeedbackResponse {
  id: string;
  submissionId?: string;
  feedbackType?: string;
  sentiment?: string;
  fullName?: string;
  contact?: string;
  locationId: string;
  locationName: string;
  site?: string;
  siteId: string;
  siteName: string;
  floor: string;
  account?: string;
  areaType?: string;
  locationScope?: LocationScope;
  category: string;
  subcategory?: string;
  rating: SmileyRating;
  priority?: "Low" | "Medium" | "High" | "Critical";
  status?: "New" | "Reviewed" | "Assigned" | "In Progress" | "On Hold" | "Escalated" | "Resolved" | "Closed" | "Declined" | "Archived" | "new" | "reviewed" | "in_progress" | "resolved" | "archived";
  assignedTeam?: string;
  source?: "Web" | "Kiosk" | "QR";
  followUpItems?: string[];
  comment?: string;
  message?: string;
  adminNotes?: string;
  isAnonymous: boolean;
  respondentType: "customer" | "employee" | "visitor" | "applicant";
  language: string;
  deviceId: string;
  submittedAt: string;
  createdAt?: string;
  updatedAt?: string;
  sessionDuration?: number;
}

export interface HappinessIndex {
  score: number;
  label: "Excellent" | "Good" | "Average" | "Poor" | "Critical";
  color: string;
  trend: number;
  trendDirection: "up" | "down" | "stable";
  totalResponses: number;
  veryHappyCount: number;
  happyCount: number;
  neutralCount?: number;
  unhappyCount: number;
  veryUnhappyCount: number;
  veryHappyPct: number;
  happyPct: number;
  neutralPct?: number;
  unhappyPct: number;
  veryUnhappyPct: number;
}

export type LocationType =
  | "restroom"
  | "pantry"
  | "elevator"
  | "helpdesk"
  | "training-room"
  | "recruitment"
  | "production-floor"
  | "cafeteria"
  | "security-desk"
  | "meeting-room"
  | "smoking-area"
  | "visitor-welcome"
  | "hr-office"
  | "payroll-office"
  | "lobby"
  | "parking"
  | "gym"
  | "reception"
  | "server-room"
  | "custom";

export type LocationCategory =
  | "Facilities"
  | "IT"
  | "HR"
  | "Security"
  | "Operations"
  | "Recruitment"
  | "Training"
  | "Hospitality"
  | "Payroll"
  | "Visitor";

export interface Location {
  id: string;
  name: string;
  type: LocationType;
  siteId: string;
  siteName: string;
  floor: string;
  scope?: LocationScope;
  account?: string;
  categoryGroup?: string;
  category: LocationCategory;
  description?: string;
  isActive: boolean;
  kioskIds: string[];
  qrCode?: string;
  coordinates?: { x: number; y: number };
  alertThreshold: number;
  createdAt: string;
}

export type LocationScope = "site-wide" | "floor-shared" | "account-specific" | "department-service";

export interface Site {
  id: string;
  name: "Noel" | "Annex" | "Macias" | "Consuelo" | "Resident Home";
  address: string;
  floors: Floor[];
  isActive: boolean;
}

export interface Floor {
  id: string;
  name: string;
  level: number;
  siteId: string;
}

export interface KioskDevice {
  id: string;
  locationId: string;
  locationName: string;
  siteId: string;
  floor: string;
  model: "Smiley Touch" | "Smiley Digital" | "QR Terminal" | "Tablet";
  status: "online" | "offline" | "warning" | "maintenance";
  batteryLevel: number;
  connectivity: "wifi" | "ethernet" | "cellular";
  signalStrength: number;
  lastSyncAt: string;
  lastFeedbackAt?: string;
  touchscreenHealth: number;
  uptime: number;
  firmwareVersion: string;
  assignedAt: string;
  ipAddress: string;
  feedbackToday: number;
}

export type AlertType =
  | "low-satisfaction"
  | "consecutive-negative"
  | "device-offline"
  | "sla-breach"
  | "high-volume-complaints"
  | "no-response"
  | "device-battery"
  | "internet-outage"
  | "satisfaction-drop";

export interface Alert {
  id: string;
  type: AlertType;
  priority: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  locationId?: string;
  locationName?: string;
  siteId?: string;
  deviceId?: string;
  ticketId?: string;
  status: "new" | "acknowledged" | "in-progress" | "resolved" | "dismissed";
  triggeredAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  assignedTo?: string;
  triggerValue?: number;
  thresholdValue?: number;
  autoCreatedTicket: boolean;
}

export type TicketStatus = "new" | "assigned" | "in-progress" | "on-hold" | "resolved" | "closed" | "escalated";

export interface Ticket {
  id: string;
  feedbackId?: string;
  alertId?: string;
  title: string;
  description: string;
  category: LocationCategory;
  priority: "critical" | "high" | "medium" | "low";
  status: TicketStatus;
  locationId: string;
  locationName: string;
  siteId: string;
  assignedTo?: string;
  department: string;
  createdAt: string;
  updatedAt: string;
  slaDeadline: string;
  slaBreached: boolean;
  resolvedAt?: string;
  closedAt?: string;
  timeToResolve?: number;
  rating?: SmileyRating;
  notes: TicketNote[];
}

export interface TicketNote {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  isInternal: boolean;
}

export type UserRole =
  | "super-admin"
  | "admin"
  | "stl"
  | "team-leader"
  | "it-staff"
  | "facilities"
  | "hr"
  | "payroll"
  | "security"
  | "recruiter"
  | "viewer"
  | "kiosk-only";

export type Permission =
  | "view-all-sites"
  | "manage-users"
  | "manage-devices"
  | "view-reports"
  | "export-reports"
  | "manage-alerts"
  | "manage-tickets"
  | "configure-surveys"
  | "view-analytics"
  | "manage-locations"
  | "view-audit-logs"
  | "admin-settings";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  department: string;
  siteIds: string[];
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  permissions: Permission[];
}

export type ReportType =
  | "daily"
  | "weekly"
  | "monthly"
  | "executive"
  | "stl"
  | "it"
  | "facilities"
  | "hr"
  | "payroll"
  | "recruitment"
  | "client-experience"
  | "custom";

export interface Report {
  id: string;
  title: string;
  type: ReportType;
  generatedBy: string;
  generatedAt: string;
  dateRange: { from: string; to: string };
  filters: ReportFilters;
  status: "generating" | "ready" | "failed";
  fileUrl?: string;
  fileSize?: number;
}

export interface ReportFilters {
  sites?: string[];
  floors?: string[];
  locations?: string[];
  categories?: string[];
  satisfactionRange?: [number, number];
  ticketStatus?: TicketStatus[];
}

export interface AIInsight {
  id: string;
  type: "sentiment" | "prediction" | "anomaly" | "recommendation" | "trend";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  locationId?: string;
  category?: string;
  confidence: number;
  generatedAt: string;
  actionRequired: boolean;
  recommendation?: string;
  data?: Record<string, unknown>;
}
