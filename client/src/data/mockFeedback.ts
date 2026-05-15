import { subDays, setHours, setMinutes } from "date-fns";
import type { FeedbackResponse, SmileyRating } from "@/types/index";
import { mockLocations } from "@/data/mockLocations";

const comments = [
  "Fast response from the support team.",
  "Area was clean and easy to use.",
  "Waiting time was longer than expected.",
  "WiFi was unstable during shift start.",
  "AC temperature was uncomfortable.",
  "Security was professional and helpful.",
  "Printer queue needed attention.",
  "Training room audio was clear.",
  "Applicant process felt organized.",
  "Pantry supplies need refilling.",
];

const respondentTypes: FeedbackResponse["respondentType"][] = ["employee", "employee", "employee", "visitor", "applicant", "customer"];
const categories = ["Facilities", "IT", "HR", "Security", "Operations", "Recruitment", "Training", "Payroll", "Visitor"];

function seeded(index: number) {
  const value = Math.sin(index * 999.91) * 10000;
  return value - Math.floor(value);
}

function pick<T>(items: T[], index: number) {
  return items[Math.floor(seeded(index) * items.length) % items.length];
}

function ratingFor(index: number, day: Date): SmileyRating {
  const hour = day.getHours();
  const weekday = day.getDay();
  const peakPenalty = [9, 10, 13, 14, 17, 18].includes(hour) ? 0.1 : 0;
  const dayPenalty = weekday === 1 || weekday === 5 ? 0.1 : 0;
  const roll = seeded(index + 13) + peakPenalty + dayPenalty;
  if (roll < 0.42) return 5;
  if (roll < 0.72) return 4;
  if (roll < 0.82) return 3;
  if (roll < 0.94) return 2;
  return 1;
}

export function generateMockFeedback(count = 1200): FeedbackResponse[] {
  return Array.from({ length: count }).map((_, index) => {
    const location = pick(mockLocations, index);
    const daysAgo = Math.floor(seeded(index + 2) * 90);
    const peakHours = [9, 10, 11, 13, 14, 15, 17, 18, 19];
    const hour = seeded(index + 5) > 0.62 ? pick(peakHours, index + 7) : Math.floor(seeded(index + 9) * 24);
    const submittedAt = setMinutes(setHours(subDays(new Date("2026-05-14T16:00:00.000Z"), daysAgo), hour), Math.floor(seeded(index + 11) * 60));
    const rating = ratingFor(index, submittedAt);
    const category = location.category || pick(categories, index);

    return {
      id: `FB-${String(index + 1).padStart(5, "0")}`,
      locationId: location.id,
      locationName: location.name,
      siteId: location.siteId,
      siteName: location.siteName,
      floor: location.floor,
      category,
      subcategory: `${category} pulse`,
      rating,
      followUpItems: rating <= 2 ? ["Needs attention", "Route to owner"] : undefined,
      comment: seeded(index + 15) < 0.15 ? pick(comments, index + 17) : undefined,
      isAnonymous: seeded(index + 18) > 0.38,
      respondentType: pick(respondentTypes, index + 19),
      language: seeded(index + 20) > 0.9 ? "FIL" : "EN",
      deviceId: `KSK-${String((index % 50) + 1).padStart(3, "0")}`,
      submittedAt: submittedAt.toISOString(),
      sessionDuration: 3 + Math.floor(seeded(index + 21) * 38),
    };
  });
}

export const mockFeedback = generateMockFeedback();

