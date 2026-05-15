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

export const floorsBySite = {
  Noel: ["Ground Floor", "2nd Floor", "3rd Floor", "4th Floor", "5th Floor", "6th Floor"],
  Macias: ["Ground Floor", "2nd Floor", "3rd Floor"],
  Consuelo: ["Ground Floor", "2nd Floor", "3rd Floor", "4th Floor"],
} as const;

export const feedbackCategories = {
  "IT / Technical Feedback": [
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
  "Facilities Feedback": [
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
  "Security Feedback": ["Security guard professionalism", "Visitor verification", "ID checking", "Entry/exit process", "Safety concern", "Lost and found", "Emergency response", "Security incident report"],
  "Employee Experience Feedback": ["Workplace comfort", "Seat assignment concern", "Floor environment", "Team area concern", "Breakroom experience", "Queue/dashboard visibility", "Town hall or event support", "Internal process concern"],
  "Recruitment / Applicant Feedback": ["Recruitment experience", "Applicant waiting time", "Interview process clarity", "Recruiter professionalism", "Application process issue", "Assessment issue", "Onboarding feedback"],
  "Visitor / Client Feedback": ["Visitor welcome experience", "Client visit experience", "Reception experience", "Waiting area experience", "Meeting room readiness", "WiFi access for visitors", "ID/access process", "Overall client impression"],
  "HR Support": ["Employee relations concern", "Leave processing", "Benefits inquiry", "Policy clarification", "HR response time", "Concern handling", "Professionalism"],
  "Payroll Support": ["Payroll accuracy", "Payslip concern", "Salary dispute", "Deduction question", "Payroll response time", "Communication clarity", "Concern resolution"],
  "Custom / Others": ["Others / specify issue"],
} as const;

export const roleTypes = ["Employee", "Applicant", "Visitor", "Client", "IT", "Admin"] as const;
export const priorityLevels = ["Low", "Medium", "High", "Critical"] as const;

export const allAccounts = Object.values(siteAccounts).flat();
export const configuredSiteCount = Object.keys(siteAccounts).length;
export const configuredAccountCount = allAccounts.length;

export type LocationScope = "site-wide" | "floor-shared" | "account-specific" | "department-service";

export interface LocationItem {
  id: string;
  name: string;
  site: keyof typeof siteAccounts;
  scope: LocationScope;
  floor?: string;
  account?: string;
  categoryGroup: string;
  description: string;
  feedbackCount: number;
  satisfactionScore: number;
  status: "active" | "inactive" | "maintenance";
}
