import type { FeedbackResponse } from "@/types/index";

const csvHeaders = [
  "Submission ID",
  "Feedback Type",
  "Full Name",
  "Email",
  "Site",
  "Floor",
  "Account",
  "Department",
  "Rating",
  "Sentiment",
  "Message",
  "Status",
  "Admin Notes",
  "Submitted At",
];

function escapeCsv(value: unknown) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

export function feedbackToCsv(feedback: FeedbackResponse[]) {
  const rows = feedback.map((item) => [
    item.submissionId ?? item.id,
    item.feedbackType ?? "legacy",
    item.isAnonymous ? "Anonymous" : item.fullName ?? "",
    item.contact ?? "",
    item.siteName,
    item.floor,
    item.account ?? "",
    item.assignedTeam ?? "",
    item.rating,
    item.sentiment ?? "",
    item.message ?? item.comment ?? "",
    item.status ?? "New",
    item.adminNotes ?? "",
    item.createdAt ?? item.submittedAt,
  ]);

  return [csvHeaders, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\n");
}

export function downloadFeedbackCsv(feedback: FeedbackResponse[], filename = "ece-feedback-export.csv") {
  const blob = new Blob([feedbackToCsv(feedback)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
