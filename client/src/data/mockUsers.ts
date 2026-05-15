import type { User, UserRole } from "@/types/index";

const roles: UserRole[] = ["super-admin", "admin", "stl", "team-leader", "it-staff", "facilities", "hr", "payroll", "security", "recruiter", "viewer", "kiosk-only"];
const names = [
  "Joshua Apao",
  "Jema Jeminez",
  "Chui Goh",
  "Maria Buenviaje",
  "Cliff Tagnipis",
  "Liza Ragusta",
  "Jessa Romero",
  "Paul Santos",
  "Ana Reyes",
  "Miguel Dela Cruz",
  "Katrina Lim",
  "Rafael Mercado",
  "Patricia Gomez",
  "Noel Bautista",
  "Alyssa Villanueva",
  "Mark Batinga",
  "Rhea Cabahug",
  "Janice Cañete",
  "Paolo Tan",
  "Erika Flores",
];

export const mockUsers: User[] = names.map((name, index) => ({
  id: `USR-${String(index + 1).padStart(4, "0")}`,
  name,
  email: `${name.toLowerCase().replace(/\s+/g, ".")}@ece.pulse`,
  role: roles[index % roles.length],
  department: ["Operations", "IT", "Facilities", "HR", "Payroll", "Security", "Recruitment"][index % 7],
  siteIds: index % 3 === 0 ? ["site-noel", "site-macias", "site-consuelo"] : ["site-noel"],
  isActive: index % 9 !== 0,
  lastLoginAt: new Date(Date.now() - index * 9 * 3600000).toISOString(),
  createdAt: "2026-01-05T08:00:00.000Z",
  permissions: index < 2 ? ["view-all-sites", "manage-users", "manage-devices", "view-reports", "export-reports", "manage-alerts", "manage-tickets", "configure-surveys", "view-analytics", "manage-locations", "view-audit-logs", "admin-settings"] : ["view-analytics", "view-reports"],
}));

