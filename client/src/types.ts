export type Role =
  | "Super Admin"
  | "Admin"
  | "STL"
  | "TL"
  | "IT Staff"
  | "Facilities"
  | "HR"
  | "Payroll"
  | "Security"
  | "Manager"
  | "Agent"
  | "Viewer";

export type FeedbackStatus = "New" | "Reviewed" | "In Progress" | "Resolved" | "Archived";

export type Rating = "Very Unsatisfied" | "Unsatisfied" | "Neutral" | "Satisfied" | "Very Satisfied";

export type AlertPriority = "Critical" | "High" | "Medium" | "Low";

export type AlertStatus = "New" | "Reviewed" | "Assigned" | "In Progress" | "On Hold" | "Resolved" | "Closed" | "Escalated";

export type TicketStatus = "New" | "Assigned" | "In Progress" | "On Hold" | "Resolved" | "Closed" | "Escalated";

export interface User {
  id: string;
  fullName: string;
  employeeId?: string;
  email: string;
  role: Role;
  site?: string;
  accountDepartment?: string;
  isActive?: boolean;
}

export interface FeedbackRecord {
  id: string;
  feedbackId: string;
  fullName: string;
  employeeOrVisitorId: string;
  role: string;
  site: string;
  floor: string;
  accountDepartment: string;
  category: string;
  rating: Rating;
  ratingScore: number;
  issues: string[];
  comment?: string;
  attachmentUrl?: string;
  deviceKioskId?: string;
  submittedByUserId?: string;
  status: FeedbackStatus;
  assignedTeam: Department;
  adminNotes?: string;
  resolutionNotes?: string;
  createdAt: string;
  updatedAt?: string;
  source?: "Kiosk" | "QR" | "Web" | "Mobile";
}

export type Department = "IT" | "Facilities" | "HR" | "Payroll" | "Security" | "Recruitment" | "Operations" | "Training" | "Admin";

export interface AlertItem {
  id: string;
  title: string;
  type: string;
  site: string;
  floor: string;
  category: string;
  priority: AlertPriority;
  status: AlertStatus;
  createdAt: string;
  assignedTeam: Department;
  description: string;
}

export interface TicketItem {
  id: string;
  ticketId: string;
  feedbackId?: string;
  category: string;
  site: string;
  floor: string;
  department: Department;
  priority: AlertPriority;
  slaMinutes: number;
  status: TicketStatus;
  createdAt: string;
  assignedOwner: string;
  summary: string;
}

export interface DeviceItem {
  id: string;
  deviceId: string;
  location: string;
  site: string;
  floor: string;
  status: "Online" | "Offline" | "Warning";
  battery: number;
  connectivity: "Stable" | "Weak" | "Disconnected";
  lastSync: string;
  touchscreenHealth: number;
  uptime: string;
}

export interface SiteFloor {
  name: string;
  accounts: string[];
}

export interface SiteConfig {
  name: string;
  floors: SiteFloor[];
}

export interface ChartPoint {
  name: string;
  value: number;
  secondary?: number;
  tertiary?: number;
}

export interface HeatmapCell {
  label: string;
  month: string;
  value: number;
}

export interface SolutionItem {
  title: string;
  description: string;
  icon: string;
  route: string;
  category: string;
}

export interface ModuleConfig {
  title: string;
  route: string;
  subtitle: string;
  owner: Department;
  accent: string;
  metrics: ChartPoint[];
  categories: string[];
}

export interface Summary {
  totalFeedback: number;
  satisfactionRate: number;
  unsatisfiedFeedback: number;
  openActionItems: number;
}

export interface DashboardCharts {
  trend: ChartPoint[];
  bySite: ChartPoint[];
  byCategory: ChartPoint[];
  ratingDistribution: ChartPoint[];
}

export interface MetaData {
  accounts: string[];
  adminMenu: string[];
  assignedTeams: Department[];
  feedbackCategories: string[];
  feedbackStatuses: FeedbackStatus[];
  ratings: Array<{ label: Rating; score: number; emoji: string }>;
  roles: Role[];
  sites: SiteConfig[];
  userTypes: string[];
}
