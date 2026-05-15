import { feedbackCategories, ratings, sites } from "../../shared/constants.js";

function emptyCountMap(keys) {
  return Object.fromEntries(keys.map((key) => [key, 0]));
}

function dayKey(date) {
  return new Date(date).toISOString().slice(0, 10);
}

export function buildDashboardAnalytics(records) {
  const active = records.filter((item) => item.status !== "Archived");
  const totalFeedback = active.length;
  const satisfied = active.filter((item) => item.rating === "Satisfied" || item.rating === "Very Satisfied").length;
  const unsatisfiedFeedback = active.filter((item) => item.rating === "Unsatisfied" || item.rating === "Very Unsatisfied").length;
  const openActionItems = active.filter((item) => ["New", "Reviewed", "In Progress"].includes(item.status)).length;
  const satisfactionRate = totalFeedback ? Math.round((satisfied / totalFeedback) * 100) : 0;

  const trendMap = {};
  active.forEach((item) => {
    const key = dayKey(item.createdAt);
    trendMap[key] = (trendMap[key] || 0) + 1;
  });

  const siteMap = emptyCountMap(sites.map((site) => site.name));
  const categoryMap = emptyCountMap(feedbackCategories);
  const ratingMap = emptyCountMap(ratings.map((rating) => rating.label));

  active.forEach((item) => {
    siteMap[item.site] = (siteMap[item.site] || 0) + 1;
    categoryMap[item.category] = (categoryMap[item.category] || 0) + 1;
    ratingMap[item.rating] = (ratingMap[item.rating] || 0) + 1;
  });

  return {
    summary: {
      totalFeedback,
      satisfactionRate,
      unsatisfiedFeedback,
      openActionItems,
    },
    charts: {
      trend: Object.entries(trendMap).sort(([a], [b]) => a.localeCompare(b)).map(([name, value]) => ({ name, value })),
      bySite: Object.entries(siteMap).map(([name, value]) => ({ name, value })),
      byCategory: Object.entries(categoryMap).filter(([, value]) => value > 0).map(([name, value]) => ({ name, value })),
      ratingDistribution: Object.entries(ratingMap).map(([name, value]) => ({ name, value })),
    },
    recent: active.slice(0, 8),
  };
}

export function buildReportSummary(records) {
  const analytics = buildDashboardAnalytics(records);
  const comments = records.filter((item) => item.comment).map((item) => item.comment);
  const accountMap = {};
  records.forEach((item) => {
    accountMap[item.accountDepartment] = (accountMap[item.accountDepartment] || 0) + 1;
  });

  return {
    ...analytics.summary,
    commonIssues: analytics.charts.byCategory.slice(0, 5),
    commentsSummary: comments.length ? comments.slice(0, 10) : [],
    sitePerformance: analytics.charts.bySite,
    accountPerformance: Object.entries(accountMap).map(([name, value]) => ({ name, value })),
    categoryBreakdown: analytics.charts.byCategory,
  };
}
