export const roles = ["Admin", "Manager", "TL", "STL", "Agent", "Viewer"];

export const feedbackStatuses = ["New", "Reviewed", "In Progress", "Resolved", "Archived"];

export const assignedTeams = ["IT", "Facilities", "HR", "Payroll", "Security", "Training", "Admin"];

export const ratings = [
  { label: "Very Unsatisfied", score: 1, emoji: "😞" },
  { label: "Unsatisfied", score: 2, emoji: "🙁" },
  { label: "Satisfied", score: 4, emoji: "🙂" },
  { label: "Very Satisfied", score: 5, emoji: "😄" },
];

export const userTypes = [
  "Agent",
  "Team Leader",
  "Senior Team Leader",
  "Manager",
  "Client / Visitor",
  "Applicant",
  "IT Staff",
  "Facilities Staff",
  "HR / Payroll Staff",
  "Other",
];

export const sites = [
  {
    name: "Noel",
    floors: [
      { name: "Ground Floor", accounts: ["Walmart"] },
      { name: "2nd Floor", accounts: ["Ashley Voice"] },
      { name: "3rd Floor", accounts: ["Ashley Support", "Wyze", "Papaya"] },
      { name: "4th Floor", accounts: ["Resident Home"] },
      { name: "5th Floor", accounts: ["Walmart", "Bubble", "Clearwater"] },
      { name: "6th Floor", accounts: ["Flex"] },
    ],
  },
  {
    name: "Macias",
    floors: [
      { name: "Ground Floor", accounts: ["IT Support", "Security"] },
      { name: "2nd Floor", accounts: ["Training", "Recruitment"] },
      { name: "3rd Floor", accounts: ["HR", "Payroll"] },
    ],
  },
  {
    name: "Consuelo",
    floors: [
      { name: "Ground Floor", accounts: ["Facilities", "Security"] },
      { name: "2nd Floor", accounts: ["Walmart", "Flex"] },
      { name: "3rd Floor", accounts: ["Clearwater", "Bubble"] },
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
];

export const feedbackCategories = [
  "IT Service Feedback",
  "Facilities Management",
  "Employee Satisfaction",
  "Internet / WiFi Quality",
  "AC Temperature Comfort",
  "Security Guard Professionalism",
  "Pantry / Restroom Experience",
  "Elevator / Common Area Feedback",
  "HR Support Satisfaction",
  "Payroll Support Satisfaction",
  "Recruitment Applicant Experience",
  "Training Session Effectiveness",
  "Visitor / Client Welcome Feedback",
  "Smoking Area Satisfaction",
  "Other",
];

export const adminMenu = [
  "Dashboard Overview",
  "Feedback Records",
  "User Management",
  "Kiosk Management",
  "Export Reports",
  "Settings",
];

export function inferAssignedTeam(category = "") {
  if (category.includes("IT") || category.includes("Internet") || category.includes("WiFi")) return "IT";
  if (category.includes("Facilities") || category.includes("AC") || category.includes("Pantry") || category.includes("Elevator") || category.includes("Smoking")) return "Facilities";
  if (category.includes("Payroll")) return "Payroll";
  if (category.includes("HR") || category.includes("Employee")) return "HR";
  if (category.includes("Security") || category.includes("Visitor") || category.includes("Client")) return "Security";
  if (category.includes("Training") || category.includes("Recruitment")) return "Training";
  return "Admin";
}
