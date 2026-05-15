import type { FeedbackResponse, HappinessIndex } from "@/types/index";

export function happinessColor(score: number) {
  if (score >= 90) return "#16A34A";
  if (score >= 70) return "#22C55E";
  if (score >= 50) return "#F59E0B";
  if (score >= 30) return "#EF4444";
  return "#DC2626";
}

export function happinessLabel(score: number): HappinessIndex["label"] {
  if (score >= 90) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Average";
  if (score >= 30) return "Poor";
  return "Critical";
}

export function calculateHappinessIndex(responses: FeedbackResponse[], previousResponses: FeedbackResponse[] = []): HappinessIndex {
  const totalResponses = responses.length;
  const counts = {
    veryHappyCount: responses.filter((item) => item.rating === 5).length,
    happyCount: responses.filter((item) => item.rating === 4).length,
    neutralCount: responses.filter((item) => item.rating === 3).length,
    unhappyCount: responses.filter((item) => item.rating === 2).length,
    veryUnhappyCount: responses.filter((item) => item.rating === 1).length,
  };
  const averageRating = totalResponses ? responses.reduce((sum, item) => sum + item.rating, 0) / totalResponses : 0;
  const score = totalResponses ? Math.round((averageRating / 5) * 100) : 0;
  const previousScore = previousResponses.length ? calculateHappinessIndex(previousResponses).score : score;
  const trend = Number((score - previousScore).toFixed(1));
  const pct = (count: number) => (totalResponses ? Math.round((count / totalResponses) * 1000) / 10 : 0);

  return {
    score,
    label: happinessLabel(score),
    color: happinessColor(score),
    trend,
    trendDirection: trend > 0 ? "up" : trend < 0 ? "down" : "stable",
    totalResponses,
    ...counts,
    veryHappyPct: pct(counts.veryHappyCount),
    happyPct: pct(counts.happyCount),
    neutralPct: pct(counts.neutralCount),
    unhappyPct: pct(counts.unhappyCount),
    veryUnhappyPct: pct(counts.veryUnhappyCount),
  };
}

