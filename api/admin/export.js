import { buildFeedbackQuery, feedbackCsv, methodNotAllowed, requireAdmin, supabaseAdmin } from "../_utils.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res);
  if (!requireAdmin(req, res)) return undefined;
  try {
    const { data, error } = await buildFeedbackQuery(supabaseAdmin(), req.query);
    if (error) throw new Error(error.message);
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=ece-feedback-export.csv");
    return res.end(feedbackCsv(data ?? []));
  } catch (error) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    return res.end(JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Could not export feedback." }));
  }
}
