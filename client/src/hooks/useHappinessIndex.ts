import type { FeedbackResponse } from "@/types/index";
import { calculateHappinessIndex } from "@/utils/happinessCalculator";

export function useHappinessIndex(responses: FeedbackResponse[], previousResponses: FeedbackResponse[] = []) {
  return calculateHappinessIndex(responses, previousResponses);
}

