import type { Report } from "@/types/index";

export const mockReports: Report[] = [
  "Daily Operations Pulse",
  "Weekly Executive Summary",
  "Monthly Facilities Report",
  "IT Support Satisfaction",
  "Recruitment Experience Snapshot",
  "Client Visit Experience",
].map((title, index) => ({
  id: `RPT-${String(index + 1).padStart(4, "0")}`,
  title,
  type: ["daily", "weekly", "monthly", "it", "recruitment", "client-experience"][index] as Report["type"],
  generatedBy: "ECE Pulse",
  generatedAt: new Date(Date.now() - index * 86400000).toISOString(),
  dateRange: {
    from: new Date(Date.now() - (index + 7) * 86400000).toISOString(),
    to: new Date(Date.now() - index * 86400000).toISOString(),
  },
  filters: { sites: ["Noel", "Macias", "Consuelo"], satisfactionRange: [0, 100] },
  status: "ready",
  fileUrl: "#",
  fileSize: 1200000 + index * 92000,
}));

