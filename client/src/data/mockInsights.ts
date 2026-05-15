import type { AIInsight } from "@/types/index";

export const mockInsights: AIInsight[] = [
  {
    id: "INS-001",
    type: "prediction",
    title: "Predicted Peak Dissatisfaction: 2PM-4PM",
    description: "Volume and lower ratings cluster around post-lunch shifts on production floors.",
    impact: "high",
    confidence: 88,
    generatedAt: new Date().toISOString(),
    actionRequired: true,
    recommendation: "Add floor support coverage before 2PM.",
  },
  {
    id: "INS-002",
    type: "anomaly",
    title: "Restroom Annex 2F needs attention",
    description: "Feedback shifted negative after repeated comments about cleanliness and supplies.",
    impact: "high",
    category: "Facilities",
    confidence: 91,
    generatedAt: new Date().toISOString(),
    actionRequired: true,
    recommendation: "Dispatch facilities and verify after resolution.",
  },
  {
    id: "INS-003",
    type: "trend",
    title: "Monday satisfaction 12% below average",
    description: "Shift-start experience is lower on Mondays, especially for IT and WiFi categories.",
    impact: "medium",
    confidence: 82,
    generatedAt: new Date().toISOString(),
    actionRequired: true,
  },
  {
    id: "INS-004",
    type: "sentiment",
    title: "IT Helpdesk improving +8.2% this week",
    description: "Recent tickets closed faster and positive comments increased.",
    impact: "low",
    category: "IT",
    confidence: 79,
    generatedAt: new Date().toISOString(),
    actionRequired: false,
  },
];

