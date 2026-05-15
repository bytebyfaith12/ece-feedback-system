import type {
  AlertItem,
  ChartPoint,
  Department,
  DeviceItem,
  HeatmapCell,
  ModuleConfig,
  Rating,
  Role,
  SiteConfig,
  SolutionItem,
  TicketItem,
} from "@/types";

export const ratingOptions: Array<{ label: Rating; score: number; emoji: string; tone: string }> = [
  { label: "Very Unsatisfied", score: 1, emoji: "😡", tone: "bg-rose-100 text-rose-700 border-rose-200" },
  { label: "Unsatisfied", score: 2, emoji: "☹", tone: "bg-orange-100 text-orange-700 border-orange-200" },
  { label: "Neutral", score: 3, emoji: "😐", tone: "bg-amber-100 text-amber-700 border-amber-200" },
  { label: "Satisfied", score: 4, emoji: "🙂", tone: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { label: "Very Satisfied", score: 5, emoji: "😊", tone: "bg-cyan-100 text-cyan-700 border-cyan-200" },
];

export const fourPointRatings = ratingOptions.filter((rating) => rating.label !== "Neutral");

export const roles: Role[] = [
  "Super Admin",
  "Admin",
  "STL",
  "TL",
  "IT Staff",
  "Facilities",
  "HR",
  "Payroll",
  "Security",
  "Manager",
  "Agent",
  "Viewer",
];

export const departments: Department[] = ["IT", "Facilities", "HR", "Payroll", "Security", "Recruitment", "Operations", "Training", "Admin"];

export const sites: SiteConfig[] = [
  {
    name: "Noel",
    floors: [
      { name: "Ground Floor - Walmart", accounts: ["Walmart", "Security Desk", "Visitor Welcome Area"] },
      { name: "2nd Floor - Ashley Voice", accounts: ["Ashley", "Restroom", "Pantry"] },
      { name: "3rd Floor - Ashley Support, Wyze, Papaya", accounts: ["Ashley", "Wyze", "Papaya"] },
      { name: "4th Floor - Resident Home", accounts: ["Resident Home", "Recruitment"] },
      { name: "5th Floor - Walmart, Bubble, Clearwater", accounts: ["Walmart", "Bubble", "Clearwater"] },
      { name: "6th Floor - Flex", accounts: ["Flex", "Training Room"] },
    ],
  },
  {
    name: "Annex",
    floors: [
      { name: "Ground Floor - Recruitment", accounts: ["Recruitment", "Visitor Welcome Area"] },
      { name: "2nd Floor - Operations", accounts: ["Walmart", "Facilities"] },
      { name: "3rd Floor - Support", accounts: ["IT Support", "HR", "Payroll"] },
    ],
  },
  {
    name: "Macias",
    floors: [
      { name: "Ground Floor - Client Services", accounts: ["Client Visit Areas", "Security"] },
      { name: "2nd Floor - Training", accounts: ["Training", "Recruitment"] },
    ],
  },
  {
    name: "Consuelo",
    floors: [
      { name: "Ground Floor - Operations", accounts: ["Flex", "Clearwater"] },
      { name: "2nd Floor - Shared Services", accounts: ["IT Support", "Facilities"] },
    ],
  },
  {
    name: "Resident Home",
    floors: [
      { name: "Remote Support Hub", accounts: ["Resident Home", "IT Support", "HR"] },
    ],
  },
];

export const accounts = [
  "Walmart",
  "Ashley",
  "Wyze",
  "Papaya",
  "Resident Home",
  "Bubble",
  "Clearwater",
  "Flex",
  "HR",
  "Payroll",
  "Recruitment",
  "Facilities",
  "IT Support",
  "Security",
  "Training",
  "Pantry",
  "Restroom",
];

export const feedbackCategories = [
  "Restroom",
  "Pantry",
  "Elevator",
  "IT Helpdesk",
  "Training Room",
  "Recruitment Area",
  "Production Floor",
  "Cafeteria",
  "Security Desk",
  "Meeting Rooms",
  "Smoking Area",
  "Visitor Welcome Area",
  "HR Support Area",
  "Payroll Support Area",
  "Internet Outage",
  "WiFi Quality",
  "AC Temperature Comfort",
];

export const followUpQuestions: Record<string, string[]> = {
  Restroom: ["Dirty restroom", "No tissue", "No soap", "Water problem", "Bad odor", "Broken sink"],
  Pantry: ["Dirty area", "No drinking water", "Microwave broken", "Refrigerator issue", "Crowded area", "Food smell issue"],
  Elevator: ["Elevator slow", "Unsafe feeling", "Long waiting time", "Hot temperature", "Not working"],
  "IT Helpdesk": ["Slow response", "Device issue", "Printer issue", "Internet issue", "Unresolved ticket", "Poor communication"],
  "Internet Outage": ["No internet", "Slow browsing", "VPN issue", "WiFi unstable", "Packet loss", "ISP outage", "Floor-wide outage"],
  "Visitor Welcome Area": ["Reception experience", "Waiting time", "Staff accommodation", "Meeting room preparation", "Cleanliness", "Overall first impression"],
  "Smoking Area": ["Dirty area", "Poor ventilation", "Crowded", "Bad odor", "Seating issue", "Maintenance issue"],
  "WiFi Quality": ["Weak signal", "Frequent disconnect", "Dead zone", "Slow speed", "Floor congestion", "Access point issue"],
  "Security Desk": ["Friendliness", "Helpfulness", "ID verification experience", "Entrance assistance", "Professionalism", "Incident concern"],
  "Recruitment Area": ["Waiting time", "Recruiter professionalism", "Assessment experience", "Communication clarity", "Interview process", "Office environment"],
  "AC Temperature Comfort": ["Too hot", "Too cold", "AC not working", "Uneven cooling", "Humidity issue", "Poor airflow"],
  "Training Room": ["Trainer performance", "Content quality", "Training materials", "Audio/video setup", "Engagement level", "Learning effectiveness"],
  "HR Support Area": ["Slow response", "Concern handling", "Leave processing", "Employee relations", "Professionalism", "Communication clarity"],
  "Payroll Support Area": ["Payroll accuracy", "Response speed", "Payslip concern", "Salary dispute", "Communication clarity", "Concern resolution"],
  "Production Floor": ["Noise level", "Station comfort", "Tool availability", "Team support", "Cleanliness", "Escalation support"],
  Cafeteria: ["Food quality", "Queue time", "Cleanliness", "Seating availability", "Payment issue", "Food temperature"],
  "Meeting Rooms": ["Room readiness", "AV setup", "Cleanliness", "Air conditioning", "Booking conflict", "Connectivity"],
};

export const solutions: SolutionItem[] = [
  { title: "IT Service Feedback", description: "Track response speed, device issues, printers, internet, and ticket closure quality.", icon: "Laptop", route: "/it-service", category: "Services" },
  { title: "Facilities Management", description: "Capture restroom, pantry, elevator, common area, and maintenance satisfaction.", icon: "Building2", route: "/facilities", category: "Improve" },
  { title: "HR Support", description: "Measure how supported employees feel when asking for HR help.", icon: "HeartHandshake", route: "/hr-support", category: "Employee Experience" },
  { title: "Payroll Support", description: "Monitor payslip concerns, salary disputes, and resolution confidence.", icon: "WalletCards", route: "/payroll-support", category: "Employee Experience" },
  { title: "Visitor/Client Welcome", description: "Know how clients and visitors experience reception, rooms, and first impressions.", icon: "Handshake", route: "/visitor-feedback", category: "Experience" },
  { title: "Internet Outage Reporting", description: "Route VPN, ISP, packet loss, and floor-wide outage reports to IT instantly.", icon: "WifiOff", route: "/internet-outage", category: "Services" },
  { title: "WiFi Quality", description: "Map weak signal, dead zones, slow browsing, and access point issues by floor.", icon: "Wifi", route: "/wifi-quality", category: "Services" },
  { title: "Security Professionalism", description: "Measure friendliness, assistance, ID checks, entrance flow, and incident concerns.", icon: "ShieldCheck", route: "/security", category: "Services" },
  { title: "Recruitment Experience", description: "Capture applicant feedback from waiting time to assessment and interview clarity.", icon: "UserRoundSearch", route: "/recruitment", category: "BPO Operations" },
  { title: "AC Temperature Comfort", description: "Track hot spots, cold zones, airflow, humidity, and cooling problems.", icon: "ThermometerSun", route: "/ac-comfort", category: "Facilities" },
  { title: "Training Session Effectiveness", description: "Evaluate trainer performance, content quality, tools, engagement, and learning.", icon: "Presentation", route: "/training", category: "BPO Operations" },
  { title: "Smoking Area Satisfaction", description: "Monitor cleanliness, ventilation, crowding, odor, and maintenance issues.", icon: "CloudFog", route: "/smoking-area", category: "Facilities" },
  { title: "Employee Satisfaction", description: "Run fast pulse checks for morale, workplace support, and floor experience.", icon: "SmilePlus", route: "/employee-satisfaction", category: "Employee Experience" },
  { title: "Real-Time Monitoring", description: "Watch feedback, alerts, devices, SLA progress, and escalation queues live.", icon: "Activity", route: "/dashboard", category: "Analyze" },
  { title: "Smart Reporting", description: "Generate daily, weekly, monthly, executive, and department reports.", icon: "FileBarChart2", route: "/reports", category: "Analyze" },
  { title: "Ticketing Integration", description: "Turn negative feedback into action items with owner, SLA, and closure loop.", icon: "TicketCheck", route: "/tickets", category: "Improve" },
  { title: "Executive Dashboards", description: "Give leaders a 360-degree view of satisfaction, operations, and risk.", icon: "LayoutDashboard", route: "/dashboard", category: "Analyze" },
];

export const dashboardKpis = [
  { label: "Total Feedback Today", value: 960, suffix: "", trend: "+126 vs yesterday", tone: "cyan" },
  { label: "Satisfaction Rate", value: 84, suffix: "%", trend: "+3.2 pts this week", tone: "green" },
  { label: "Unsatisfied Feedback", value: 96, suffix: "", trend: "12 high priority", tone: "red" },
  { label: "Open Action Items", value: 38, suffix: "", trend: "8 nearing SLA", tone: "yellow" },
  { label: "Avg SLA Resolution Time", value: 75, suffix: "m", trend: "Target: 90m", tone: "cyan" },
  { label: "Device Health", value: 94, suffix: "%", trend: "3 devices warning", tone: "green" },
  { label: "Active Alerts", value: 14, suffix: "", trend: "2 critical", tone: "red" },
  { label: "Internet Outage Reports", value: 7, suffix: "", trend: "1 floor-wide", tone: "orange" },
];

export const feedbackVolumeTrend: ChartPoint[] = [
  { name: "1", value: 42 },
  { name: "2", value: 27 },
  { name: "3", value: 34 },
  { name: "4", value: 22 },
  { name: "5", value: 31 },
  { name: "6", value: 18 },
  { name: "7", value: 55 },
  { name: "8", value: 36 },
  { name: "9", value: 32 },
  { name: "10", value: 68 },
  { name: "11", value: 54 },
  { name: "12", value: 24 },
];

export const satisfactionTrend: ChartPoint[] = [
  { name: "Jan", value: 77 },
  { name: "Feb", value: 81 },
  { name: "Mar", value: 79 },
  { name: "Apr", value: 86 },
  { name: "May", value: 84 },
  { name: "Jun", value: 88 },
  { name: "Jul", value: 91 },
];

export const siteRankings = [
  { site: "Noel", satisfaction: 91, sla: "Above SLA", volume: 3373, alerts: 1 },
  { site: "Annex", satisfaction: 88, sla: "At SLA", volume: 5336, alerts: 2 },
  { site: "Macias", satisfaction: 90, sla: "Above SLA", volume: 1379, alerts: 1 },
  { site: "Consuelo", satisfaction: 76, sla: "Below SLA", volume: 8460, alerts: 6 },
  { site: "Resident Home", satisfaction: 94, sla: "Above SLA", volume: 3298, alerts: 0 },
];

export const categoryBreakdown: ChartPoint[] = [
  { name: "IT", value: 180 },
  { name: "Facilities", value: 240 },
  { name: "HR", value: 92 },
  { name: "Payroll", value: 70 },
  { name: "Security", value: 58 },
  { name: "Training", value: 116 },
];

export const satisfactionDistribution: ChartPoint[] = [
  { name: "Satisfied", value: 75 },
  { name: "Neutral", value: 15 },
  { name: "Dissatisfied", value: 10 },
];

export const heatmapCells: HeatmapCell[] = Array.from({ length: 84 }, (_, index) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const value = [18, 42, 55, 64, 76, 82, 91, 33, 47, 68, 87, 95][index % 12] + ((index * 7) % 19) - 9;
  return {
    label: `Day ${index + 1}`,
    month: months[index % months.length],
    value: Math.max(12, Math.min(99, value)),
  };
});

export const mockAlerts: AlertItem[] = [
  {
    id: "alert-001",
    title: "Critical internet outage",
    type: "Internet outage",
    site: "Consuelo",
    floor: "2nd Floor - Shared Services",
    category: "Internet Outage",
    priority: "Critical",
    status: "In Progress",
    createdAt: "2026-05-14T08:50:00.000Z",
    assignedTeam: "IT",
    description: "Multiple no-internet submissions from shared services within 10 minutes.",
  },
  {
    id: "alert-002",
    title: "WiFi quality warning",
    type: "WiFi issue",
    site: "Noel",
    floor: "3rd Floor - Ashley Support, Wyze, Papaya",
    category: "WiFi Quality",
    priority: "High",
    status: "Assigned",
    createdAt: "2026-05-14T08:38:00.000Z",
    assignedTeam: "IT",
    description: "Frequent disconnect reports near Wyze production bay.",
  },
  {
    id: "alert-003",
    title: "AC temperature comfort alert",
    type: "Facilities issue",
    site: "Annex",
    floor: "2nd Floor - Operations",
    category: "AC Temperature Comfort",
    priority: "Medium",
    status: "New",
    createdAt: "2026-05-14T08:22:00.000Z",
    assignedTeam: "Facilities",
    description: "Agents reported uneven cooling and hot temperature in operations area.",
  },
  {
    id: "alert-004",
    title: "HR support concern",
    type: "HR concern",
    site: "Resident Home",
    floor: "Remote Support Hub",
    category: "HR Support Area",
    priority: "Medium",
    status: "Reviewed",
    createdAt: "2026-05-14T07:59:00.000Z",
    assignedTeam: "HR",
    description: "Slow response and concern handling mentioned in two pulse responses.",
  },
];

export const mockTickets: TicketItem[] = [
  {
    id: "ticket-001",
    ticketId: "ECE-IT-2401",
    category: "Internet Outage",
    site: "Consuelo",
    floor: "2nd Floor - Shared Services",
    department: "IT",
    priority: "Critical",
    slaMinutes: 42,
    status: "In Progress",
    createdAt: "2026-05-14T08:51:00.000Z",
    assignedOwner: "Network Support",
    summary: "Floor-wide outage validation and ISP escalation.",
  },
  {
    id: "ticket-002",
    ticketId: "ECE-FAC-1187",
    category: "AC Temperature Comfort",
    site: "Annex",
    floor: "2nd Floor - Operations",
    department: "Facilities",
    priority: "High",
    slaMinutes: 63,
    status: "Assigned",
    createdAt: "2026-05-14T08:24:00.000Z",
    assignedOwner: "Facilities Team",
    summary: "Cooling inspection requested for operations bay.",
  },
  {
    id: "ticket-003",
    ticketId: "ECE-HR-0904",
    category: "HR Support Area",
    site: "Resident Home",
    floor: "Remote Support Hub",
    department: "HR",
    priority: "Medium",
    slaMinutes: 120,
    status: "New",
    createdAt: "2026-05-14T08:02:00.000Z",
    assignedOwner: "HR Support",
    summary: "Follow up on leave processing response time concern.",
  },
];

export const mockDevices: DeviceItem[] = [
  { id: "dev-001", deviceId: "KSK-NOEL-GF-01", location: "Noel Ground Floor - Walmart", site: "Noel", floor: "Ground Floor - Walmart", status: "Online", battery: 98, connectivity: "Stable", lastSync: "1 min ago", touchscreenHealth: 100, uptime: "21d 4h" },
  { id: "dev-002", deviceId: "KSK-NOEL-3F-02", location: "Noel 3F - Wyze", site: "Noel", floor: "3rd Floor - Ashley Support, Wyze, Papaya", status: "Warning", battery: 42, connectivity: "Weak", lastSync: "7 min ago", touchscreenHealth: 96, uptime: "14d 9h" },
  { id: "dev-003", deviceId: "KSK-ANNEX-2F-01", location: "Annex 2F - Operations", site: "Annex", floor: "2nd Floor - Operations", status: "Online", battery: 84, connectivity: "Stable", lastSync: "2 min ago", touchscreenHealth: 99, uptime: "18d 2h" },
  { id: "dev-004", deviceId: "KSK-CONS-2F-01", location: "Consuelo 2F - IT Support", site: "Consuelo", floor: "2nd Floor - Shared Services", status: "Offline", battery: 18, connectivity: "Disconnected", lastSync: "39 min ago", touchscreenHealth: 88, uptime: "6d 11h" },
  { id: "dev-005", deviceId: "KSK-MACIAS-TR-01", location: "Macias Training Room", site: "Macias", floor: "2nd Floor - Training", status: "Online", battery: 76, connectivity: "Stable", lastSync: "3 min ago", touchscreenHealth: 97, uptime: "29d 1h" },
];

export const aiInsights = [
  { title: "Sentiment Analysis", value: "79% positive", detail: "Strong support sentiment in Noel and Resident Home.", tone: "green" },
  { title: "Complaint Forecasting", value: "High facilities risk", detail: "Pantry and AC concerns likely to rise before lunch peak.", tone: "orange" },
  { title: "Peak Dissatisfaction Hours", value: "11 AM - 1 PM", detail: "WiFi and pantry comments cluster around break periods.", tone: "yellow" },
  { title: "Most Problematic Locations", value: "Consuelo 2F", detail: "Internet outage and response-time complaints increased.", tone: "red" },
  { title: "Root Cause Analysis", value: "Connectivity", detail: "VPN, weak signal, and packet loss share the same trend.", tone: "cyan" },
  { title: "AI Recommendations", value: "Prioritize IT routing", detail: "Assign network team before shift handoff to protect SLA.", tone: "green" },
];

export const moduleConfigs: ModuleConfig[] = [
  { title: "Facilities Management", route: "/facilities", subtitle: "Restroom, pantry, elevator, AC, smoking area, and common-area satisfaction.", owner: "Facilities", accent: "#00A86B", metrics: [{ name: "Restroom", value: 84 }, { name: "Pantry", value: 78 }, { name: "AC", value: 72 }, { name: "Elevator", value: 88 }], categories: ["Restroom", "Pantry", "Elevator", "AC Temperature Comfort", "Smoking Area"] },
  { title: "Employee Satisfaction", route: "/employee-satisfaction", subtitle: "Pulse checks for agents, team leaders, support teams, and operations floors.", owner: "Operations", accent: "#00F2FE", metrics: [{ name: "Agents", value: 86 }, { name: "TL", value: 82 }, { name: "STL", value: 90 }, { name: "Support", value: 79 }], categories: ["Production Floor", "Employee Satisfaction", "Team Support", "Workplace Experience"] },
  { title: "IT Service Feedback", route: "/it-service", subtitle: "Service desk, devices, network quality, printers, VPN, and support communication.", owner: "IT", accent: "#0A84FF", metrics: [{ name: "Response", value: 80 }, { name: "Devices", value: 76 }, { name: "Printer", value: 72 }, { name: "Internet", value: 69 }], categories: ["IT Helpdesk", "Internet Outage", "WiFi Quality", "Device Issue"] },
  { title: "HR Support", route: "/hr-support", subtitle: "Employee relations, leave processing, concern handling, and HR communication.", owner: "HR", accent: "#30D158", metrics: [{ name: "Response", value: 83 }, { name: "Leaves", value: 79 }, { name: "Relations", value: 88 }, { name: "Clarity", value: 81 }], categories: ["HR Support Area", "Leave Processing", "Employee Relations", "Concern Handling"] },
  { title: "Payroll Support", route: "/payroll-support", subtitle: "Payslip concerns, salary disputes, communication, and resolution confidence.", owner: "Payroll", accent: "#FFD60A", metrics: [{ name: "Accuracy", value: 91 }, { name: "Speed", value: 77 }, { name: "Payslip", value: 84 }, { name: "Resolution", value: 80 }], categories: ["Payroll Support Area", "Payslip Concern", "Salary Dispute", "Resolution"] },
  { title: "Recruitment Applicant Experience", route: "/recruitment", subtitle: "Applicant journey from waiting time through assessment, interview, and communication.", owner: "Recruitment", accent: "#00A86B", metrics: [{ name: "Waiting", value: 74 }, { name: "Recruiter", value: 90 }, { name: "Assessment", value: 82 }, { name: "Clarity", value: 86 }], categories: ["Recruitment Area", "Assessment", "Interview Process", "Office Environment"] },
  { title: "Visitor/Client Welcome Feedback", route: "/visitor-feedback", subtitle: "Reception, wait time, accommodation, meeting readiness, and first impressions.", owner: "Admin", accent: "#00F2FE", metrics: [{ name: "Reception", value: 92 }, { name: "Waiting", value: 81 }, { name: "Rooms", value: 88 }, { name: "Cleanliness", value: 90 }], categories: ["Visitor Welcome Area", "Reception", "Meeting Rooms", "First Impression"] },
  { title: "Internet Outage Reporting", route: "/internet-outage", subtitle: "Floor-wide outage, VPN, ISP, packet loss, and slow browsing triage.", owner: "IT", accent: "#FF3B30", metrics: [{ name: "No Internet", value: 18 }, { name: "Slow", value: 26 }, { name: "VPN", value: 12 }, { name: "Packet Loss", value: 9 }], categories: ["No internet", "Slow browsing", "VPN issue", "Packet loss"] },
  { title: "WiFi Quality Per Floor", route: "/wifi-quality", subtitle: "Weak signal, dead zones, disconnects, congestion, and AP issue monitoring.", owner: "IT", accent: "#0A84FF", metrics: [{ name: "Noel", value: 84 }, { name: "Annex", value: 78 }, { name: "Macias", value: 88 }, { name: "Consuelo", value: 69 }], categories: ["Weak signal", "Frequent disconnect", "Dead zone", "Slow speed"] },
  { title: "Security Guard Professionalism", route: "/security", subtitle: "Entrance experience, friendliness, ID verification, assistance, and incident concerns.", owner: "Security", accent: "#30D158", metrics: [{ name: "Friendliness", value: 91 }, { name: "ID Check", value: 87 }, { name: "Assistance", value: 89 }, { name: "Incidents", value: 6 }], categories: ["Friendliness", "Helpfulness", "ID verification", "Incident concern"] },
  { title: "AC Temperature Comfort", route: "/ac-comfort", subtitle: "Hot/cold reports, airflow, humidity, AC status, and cooling unevenness.", owner: "Facilities", accent: "#FF9F0A", metrics: [{ name: "Too Hot", value: 31 }, { name: "Too Cold", value: 12 }, { name: "Airflow", value: 22 }, { name: "Humidity", value: 8 }], categories: ["Too hot", "Too cold", "AC not working", "Poor airflow"] },
  { title: "Training Session Effectiveness", route: "/training", subtitle: "Trainer delivery, content quality, materials, AV setup, and learning effectiveness.", owner: "Training", accent: "#00A86B", metrics: [{ name: "Trainer", value: 92 }, { name: "Content", value: 88 }, { name: "AV", value: 80 }, { name: "Learning", value: 89 }], categories: ["Trainer performance", "Content quality", "Audio/video setup", "Learning effectiveness"] },
  { title: "Smoking Area Satisfaction", route: "/smoking-area", subtitle: "Cleanliness, ventilation, crowding, odor, seating, and maintenance tracking.", owner: "Facilities", accent: "#64748B", metrics: [{ name: "Clean", value: 74 }, { name: "Ventilation", value: 68 }, { name: "Crowding", value: 60 }, { name: "Seating", value: 72 }], categories: ["Dirty area", "Poor ventilation", "Crowded", "Bad odor"] },
];

export const liveFeed = [
  "New QR feedback submitted for Noel 3F - WiFi Quality.",
  "Ticket ECE-IT-2401 moved to In Progress.",
  "Feedback kiosk KSK-CONS-2F-01 missed heartbeat.",
  "Facilities alert assigned for Annex 2F AC temperature.",
  "STL report generated for Walmart floor pulse.",
];
