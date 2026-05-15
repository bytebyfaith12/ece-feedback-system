import { describe, expect, it } from "vitest";
import { feedbackInputSchema, ratingToSentiment, stripHtml, validateAttachment } from "@/lib/feedbackValidation";

const basePayload = {
  feedbackType: "workplace",
  fullName: "Maria Santos",
  email: "maria@example.com",
  isAnonymous: false,
  site: "Noel",
  floor: "Ground Floor",
  account: "",
  department: "Operations",
  serviceType: "",
  visitPurpose: "",
  personVisited: "",
  positionApplied: "",
  recruitmentStage: "",
  operationalConcern: "",
  rating: 5,
  category: "Work environment concern",
  message: "The work area was clean and comfortable today.",
} as const;

describe("feedback validation", () => {
  it("maps rating to sentiment", () => {
    expect(ratingToSentiment(5)).toBe("Very Positive");
    expect(ratingToSentiment(4)).toBe("Positive");
    expect(ratingToSentiment(3)).toBe("Neutral");
    expect(ratingToSentiment(2)).toBe("Negative");
    expect(ratingToSentiment(1)).toBe("Very Negative");
  });

  it("accepts a valid workplace feedback payload", () => {
    const result = feedbackInputSchema.safeParse(basePayload);
    expect(result.success).toBe(true);
  });

  it("requires a name unless anonymous is enabled", () => {
    const result = feedbackInputSchema.safeParse({ ...basePayload, fullName: "", isAnonymous: false });
    expect(result.success).toBe(false);

    const anonymous = feedbackInputSchema.safeParse({ ...basePayload, fullName: "", isAnonymous: true });
    expect(anonymous.success).toBe(true);
  });

  it("requires account for account feedback", () => {
    const result = feedbackInputSchema.safeParse({
      ...basePayload,
      feedbackType: "account",
      category: "Operational concern",
      account: "",
    });
    expect(result.success).toBe(false);
  });

  it("strips html and validates attachments", () => {
    expect(stripHtml("<b>Hello</b> team")).toBe("Hello team");
    const invalid = new File(["hello"], "script.exe", { type: "application/x-msdownload" });
    expect(validateAttachment(invalid)).toMatch(/Only images and PDF/);
  });
});
