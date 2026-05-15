import { z } from "zod";
import { accountOptions, categoryOptionsByType, floorOptions } from "@/lib/feedbackConfig";
import { feedbackStatuses, feedbackTypes, productionSites, sentiments } from "@/types/feedback";
import type { FeedbackSentiment, FeedbackType, ProductionFeedbackInput, ProductionSite } from "@/types/feedback";

export const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024;
export const allowedAttachmentTypes = ["image/png", "image/jpeg", "image/webp", "image/gif", "application/pdf"];

const emailSchema = z.string().trim().email("Enter a valid email address.").optional().or(z.literal(""));

export function ratingToSentiment(rating: number): FeedbackSentiment {
  if (rating === 5) return "Very Positive";
  if (rating === 4) return "Positive";
  if (rating === 3) return "Neutral";
  if (rating === 2) return "Negative";
  return "Very Negative";
}

export function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

export const feedbackInputSchema = z
  .object({
    feedbackType: z.enum(feedbackTypes),
    fullName: z.string().trim().max(120, "Full name must be 120 characters or less."),
    email: emailSchema,
    isAnonymous: z.boolean(),
    site: z.enum(productionSites),
    floor: z.string().trim().max(80).optional().or(z.literal("")),
    account: z.string().trim().max(120).optional().or(z.literal("")),
    department: z.string().trim().max(120).optional().or(z.literal("")),
    serviceType: z.string().trim().max(120).optional().or(z.literal("")),
    visitPurpose: z.string().trim().max(120).optional().or(z.literal("")),
    personVisited: z.string().trim().max(120).optional().or(z.literal("")),
    positionApplied: z.string().trim().max(120).optional().or(z.literal("")),
    recruitmentStage: z.string().trim().max(120).optional().or(z.literal("")),
    operationalConcern: z.string().trim().max(120).optional().or(z.literal("")),
    rating: z.coerce.number().int().min(1, "Rate your experience.").max(5, "Rating must be between 1 and 5."),
    category: z.string().trim().min(1, "Choose a category.").max(140),
    message: z.string().trim().min(10, "Please add at least 10 characters.").max(500, "Comments must be 500 characters or less."),
  })
  .superRefine((value, ctx) => {
    if (!value.isAnonymous && stripHtml(value.fullName).length < 2) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["fullName"], message: "Full name is required unless anonymous is enabled." });
    }

    const allowedCategories = categoryOptionsByType[value.feedbackType as FeedbackType];
    if (!allowedCategories.includes(value.category)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["category"], message: "Choose a valid category for this feedback type." });
    }

    if (value.floor && !(floorOptions[value.site as ProductionSite] as readonly string[]).includes(value.floor)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["floor"], message: "Choose a valid floor for the selected site." });
    }

    if (value.account && !(accountOptions[value.site as ProductionSite] as readonly string[]).includes(value.account)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["account"], message: "Choose a valid account for the selected site." });
    }

    if (value.feedbackType === "account" && !value.account) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["account"], message: "Choose the account or campaign." });
    }

    if (value.feedbackType === "service" && !value.serviceType) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["serviceType"], message: "Choose the service type." });
    }

    if (value.feedbackType === "visitor" && !value.visitPurpose) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["visitPurpose"], message: "Choose the visit purpose." });
    }

    if (value.feedbackType === "applicant" && (!value.positionApplied || !value.recruitmentStage)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["positionApplied"], message: "Position and recruitment stage are required." });
    }
  });

export function sanitizeFeedbackInput(input: ProductionFeedbackInput): ProductionFeedbackInput {
  return {
    ...input,
    fullName: input.isAnonymous ? "Anonymous" : stripHtml(input.fullName),
    email: input.email ? stripHtml(input.email).toLowerCase() : "",
    floor: input.floor ? stripHtml(input.floor) : "",
    account: input.account ? stripHtml(input.account) : "",
    department: input.department ? stripHtml(input.department) : "",
    serviceType: input.serviceType ? stripHtml(input.serviceType) : "",
    visitPurpose: input.visitPurpose ? stripHtml(input.visitPurpose) : "",
    personVisited: input.personVisited ? stripHtml(input.personVisited) : "",
    positionApplied: input.positionApplied ? stripHtml(input.positionApplied) : "",
    recruitmentStage: input.recruitmentStage ? stripHtml(input.recruitmentStage) : "",
    operationalConcern: input.operationalConcern ? stripHtml(input.operationalConcern) : "",
    category: stripHtml(input.category),
    message: stripHtml(input.message),
  };
}

export function validateAttachment(file?: File | null): string | null {
  if (!file) return null;
  if (!allowedAttachmentTypes.includes(file.type)) return "Only images and PDF files are allowed.";
  if (file.size > MAX_ATTACHMENT_SIZE) return "Attachment must be 5MB or smaller.";
  return null;
}

export function isValidStatus(value: string): value is (typeof feedbackStatuses)[number] {
  return feedbackStatuses.includes(value as (typeof feedbackStatuses)[number]);
}

export function isValidSentiment(value: string): value is (typeof sentiments)[number] {
  return sentiments.includes(value as (typeof sentiments)[number]);
}
