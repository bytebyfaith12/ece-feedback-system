import { BriefcaseBusiness, Building2, Handshake, IdCard, UserRoundSearch } from "lucide-react";
import { floorsBySite, siteAccounts } from "@/data/echoConfig";
import type { FeedbackType, ProductionSite } from "@/types/feedback";

export const siteOptions = ["Noel", "Macias", "Consuelo"] satisfies ProductionSite[];
export const productionSiteOptions = siteOptions;

export const accountOptions = siteAccounts;
export const floorOptions = floorsBySite;

export const feedbackTypeCards = [
  {
    type: "workplace",
    title: "Workplace Feedback",
    description: "Share concerns about work environment, facilities, comfort, safety, or department support.",
    icon: Building2,
  },
  {
    type: "service",
    title: "Service Feedback",
    description: "Rate support from IT, HR, Payroll, Security, Facilities, Recruitment, or admin teams.",
    icon: Handshake,
  },
  {
    type: "visitor",
    title: "Visitor Feedback",
    description: "Tell us about reception, security, visitor welcome, meeting readiness, or client visits.",
    icon: IdCard,
  },
  {
    type: "applicant",
    title: "Applicant Feedback",
    description: "Share application, recruitment, interview, assessment, and onboarding experience.",
    icon: UserRoundSearch,
  },
  {
    type: "account",
    title: "Account Feedback",
    description: "Send account or campaign feedback for production areas and operational concerns.",
    icon: BriefcaseBusiness,
  },
] as const;

export const categoryOptionsByType: Record<FeedbackType, string[]> = {
  workplace: ["Work environment concern", "Facility concern", "Comfort concern", "Safety concern", "Department support"],
  service: ["IT Helpdesk", "HR Support", "Payroll Support", "Security Support", "Facilities Support", "Recruitment Support"],
  visitor: ["Reception experience", "Security check-in", "Waiting area", "Client visit", "Meeting room readiness"],
  applicant: ["Application process", "Recruitment experience", "Interview experience", "Assessment experience", "Onboarding feedback"],
  account: ["Operational concern", "Team/account experience", "Production area", "Workstation issue", "Queue/dashboard visibility"],
};

export const departments = ["Operations", "IT", "HR", "Payroll", "Security", "Facilities", "Recruitment", "Training", "Admin"];
export const serviceTypes = ["IT Helpdesk", "HR", "Payroll", "Security", "Facilities", "Recruitment", "Admin Support"];
export const visitPurposes = ["Client visit", "Applicant visit", "Vendor visit", "Employee guest", "Meeting", "Other"];
export const recruitmentStages = ["Application", "Initial screening", "Assessment", "Interview", "Job offer", "Onboarding"];
export const departmentOptions = departments;
export const serviceTypeOptions = serviceTypes;
export const visitPurposeOptions = visitPurposes;
export const recruitmentStageOptions = recruitmentStages;
