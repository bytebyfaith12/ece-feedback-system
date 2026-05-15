export const feedbackTypes = ["workplace", "service", "visitor", "applicant", "account"] as const;
export type FeedbackType = (typeof feedbackTypes)[number];

export const feedbackTypeLabels: Record<FeedbackType, string> = {
  workplace: "Workplace Feedback",
  service: "Service Feedback",
  visitor: "Visitor Feedback",
  applicant: "Applicant Feedback",
  account: "Account Feedback",
};

export const sentiments = ["Very Negative", "Negative", "Neutral", "Positive", "Very Positive"] as const;
export type FeedbackSentiment = (typeof sentiments)[number];

export const feedbackStatuses = ["New", "Reviewed", "In Progress", "Resolved", "Archived"] as const;
export type ProductionFeedbackStatus = (typeof feedbackStatuses)[number];

export const productionSites = ["Noel", "Macias", "Consuelo"] as const;
export type ProductionSite = (typeof productionSites)[number];

export interface ProductionFeedbackInput {
  feedbackType: FeedbackType;
  fullName: string;
  email?: string;
  isAnonymous: boolean;
  site: ProductionSite;
  floor?: string;
  account?: string;
  department?: string;
  serviceType?: string;
  visitPurpose?: string;
  personVisited?: string;
  positionApplied?: string;
  recruitmentStage?: string;
  operationalConcern?: string;
  rating: number;
  category: string;
  message: string;
}

export interface ProductionFeedbackRecord extends ProductionFeedbackInput {
  id: string;
  submissionId: string;
  sentiment: FeedbackSentiment;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentType?: string;
  status: ProductionFeedbackStatus;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackFilters {
  dateFrom?: string;
  dateTo?: string;
  site?: string;
  floor?: string;
  account?: string;
  category?: string;
  rating?: string;
  sentiment?: string;
  feedbackType?: string;
  status?: string;
  search?: string;
}
