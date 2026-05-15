import { buildFeedbackQuery, methodNotAllowed, requireAdmin, sendJson, supabaseAdmin } from "../_utils.js";

function countBy(rows, key) {
  return Object.entries(rows.reduce((acc, row) => {
    const value = row[key] || "Unspecified";
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {})).map(([name, value]) => ({ name, value }));
}

export default async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res);
  if (!requireAdmin(req, res)) return undefined;
  try {
    const { data, error } = await buildFeedbackQuery(supabaseAdmin(), req.query);
    if (error) throw new Error(error.message);
    const rows = data ?? [];
    const averageRating = rows.length ? Math.round((rows.reduce((sum, row) => sum + row.rating, 0) / rows.length) * 10) / 10 : 0;
    return sendJson(res, 200, {
      success: true,
      data: {
        total: rows.length,
        averageRating,
        bySite: countBy(rows, "site"),
        byAccount: countBy(rows, "account"),
        byCategory: countBy(rows, "category"),
        bySentiment: countBy(rows, "sentiment"),
        byStatus: countBy(rows, "status"),
      },
    });
  } catch (error) {
    return sendJson(res, 500, { success: false, error: error instanceof Error ? error.message : "Could not load analytics." });
  }
}
