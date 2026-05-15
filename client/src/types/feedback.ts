export const feedbackTypes = ["workplace", "service", "visitor", "applicant", "account"] as const;
export type FeedbackType = (typeof feedbackTypes)[number];

export const feedbackTypeLabels: Record<FeedbackType, string> = {
  workplace: "Workplace Feedback",
  service: "Service Feedback",
  visitor: "Visitor Feedback",
  applicant: "Applicant Feedback",
  account: "Account Feedback",
};

export const sentiments = ["very_negative", "negative", "neutral", "positive", "very_positive"] as const;
export type FeedbackSentiment = (typeof sentiments)[number];

export const feedbackStatuses = ["new", "reviewed", "in_progress", "resolved", "archived"] as const;
export type ProductionFeedbackStatus = (typeof feedbackStatuses)[number];

export const sentimentLabels: Record<FeedbackSentiment, string> = {
  very_negative: "Very Negative",
  negative: "Negative",
  neutral: "Neutral",
  positive: "Positive",
  very_positive: "Very Positive",
};

export const feedbackStatusLabels: Record<ProductionFeedbackStatus, string> = {
  new: "New",
  reviewed: "Reviewed",
  in_progress: "In Progress",
  resolved: "Resolved",
  archived: "Archived",
};

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
  staffInvolved?: string;
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
