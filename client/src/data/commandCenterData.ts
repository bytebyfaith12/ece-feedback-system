export const siteAccounts = {
  Noel: ["Ashley", "Ashley Support", "Bubble", "Clearwater", "Flex", "Wyze", "Walmart", "Papaya", "Resident Home"],
  Macias: ["Earnin", "Homebase", "Minoan", "ILS"],
  Consuelo: [
    "Albert",
    "Coalition",
    "Daily Harvest",
    "Hippo",
    "IAA",
    "Illuminz",
    "IT",
    "Lytx",
    "NICE",
    "OfferOps",
    "Peloton",
    "PerfectServe",
    "PLS",
    "RTA",
    "Sharebite",
    "Spireon",
    "Sundays for Dogs",
    "Tremendous",
    "Volume Products",
    "Zenbusiness",
  ],
} as const;

export const siteFloors = {
  Noel: ["Ground Floor", "2nd Floor", "3rd Floor", "4th Floor", "5th Floor", "6th Floor"],
  Macias: ["Ground Floor", "2nd Floor", "3rd Floor"],
  Consuelo: ["Ground Floor", "2nd Floor", "3rd Floor", "4th Floor"],
} as const;

export const feedbackCategoryGroups = [
  {
    group: "IT / Technical Feedback",
    dashboardLabel: "IT Tools",
    assignedTeam: "IT",
    subcategories: [
      "Internet outage",
      "Intermittent internet connection",
      "Slow internet connection",
      "WiFi weak signal",
      "Tools outage",
      "VPN issue",
      "Cloudflare WARP issue",
      "Talkdesk issue",
      "Zoho issue",
      "Intercom Voice issue",
      "Google Meet issue",
      "Microsoft Teams issue",
      "Krisp issue",
      "Headset issue",
      "Microphone issue",
      "Camera issue",
      "Monitor/display issue",
      "Keyboard/mouse issue",
      "PC slow performance",
      "Login/account access issue",
      "Printer/scanner issue",
      "System unit issue",
      "Remote desktop issue",
      "Browser issue",
    ],
  },
  {
    group: "Facilities Feedback",
    dashboardLabel: "Facilities",
    assignedTeam: "Facilities",
    subcategories: [
      "AC temperature too hot",
      "AC temperature too cold",
      "Lighting issue",
      "Power outage",
      "Electrical issue",
      "Workstation issue",
      "Chair/table issue",
      "Floor cleanliness",
      "Restroom cleanliness",
      "Pantry cleanliness",
      "Water dispenser issue",
      "Elevator issue",
      "Door/access issue",
      "Noise complaint",
      "Smoking area concern",
      "Parking concern",
    ],
  },
  {
    group: "Security Feedback",
    dashboardLabel: "Security",
    assignedTeam: "Security",
    subcategories: [
      "Security guard professionalism",
      "Visitor verification",
      "ID checking",
      "Entry/exit process",
      "Safety concern",
      "Lost and found",
      "Emergency response",
      "Security incident report",
    ],
  },
  {
    group: "Employee Experience Feedback",
    dashboardLabel: "HR/Employee Experience",
    assignedTeam: "HR",
    subcategories: [
      "Workplace comfort",
      "Seat assignment concern",
      "Floor environment",
      "Team area concern",
      "Breakroom experience",
      "Queue/dashboard visibility",
      "Town hall or event support",
      "Internal process concern",
    ],
  },
  {
    group: "Recruitment / Applicant Feedback",
    dashboardLabel: "Recruitment",
    assignedTeam: "HR",
    subcategories: [
      "Recruitment experience",
      "Applicant waiting time",
      "Interview process clarity",
      "Recruiter professionalism",
      "Application process issue",
      "Assessment issue",
      "Onboarding feedback",
    ],
  },
  {
    group: "Visitor / Client Feedback",
    dashboardLabel: "Visitor Feedback",
    assignedTeam: "Admin",
    subcategories: [
      "Visitor welcome experience",
      "Client visit experience",
      "Reception experience",
      "Waiting area experience",
      "Meeting room readiness",
      "WiFi access for visitors",
      "ID/access process",
      "Overall client impression",
    ],
  },
  {
    group: "Custom Feedback",
    dashboardLabel: "Custom/Others",
    assignedTeam: "Admin",
    subcategories: ["Others / specify issue"],
  },
] as const;

export const roleTypes = ["Employee", "Applicant", "Visitor", "Client", "IT", "Admin"] as const;

export const appRoles = ["Admin", "IT", "HR", "Facilities", "Security", "Manager", "Viewer", "Applicant", "Visitor"] as const;

export const ratingOptions = [
  { label: "Very Unsatisfied", score: 1, emoji: "😡", tone: "danger" },
  { label: "Unsatisfied", score: 2, emoji: "☹", tone: "orange" },
  { label: "Neutral", score: 3, emoji: "😐", tone: "yellow" },
  { label: "Satisfied", score: 4, emoji: "🙂", tone: "green" },
  { label: "Very Satisfied", score: 5, emoji: "😊", tone: "cyan" },
] as const;

export const priorities = ["Low", "Medium", "High", "Critical"] as const;

export const statuses = ["New", "Reviewed", "Assigned", "In Progress", "On Hold", "Escalated", "Resolved", "Closed", "Declined"] as const;

export const reportTypes = ["Weekly report", "Monthly report", "Site-level report", "Account-level report", "Category-level report", "Executive report"] as const;

export const dashboardFilters = ["Site", "Floor", "Account", "Category", "Rating", "Priority", "Status", "Date range"];

export const allAccounts = Object.entries(siteAccounts).flatMap(([site, accounts]) =>
  accounts.map((name) => ({ id: `${site}-${name}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"), name, site, enabled: true })),
);
