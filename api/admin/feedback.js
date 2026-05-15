import { buildFeedbackQuery, methodNotAllowed, requireAdmin, sendJson, supabaseAdmin } from "../_utils.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res);
  if (!requireAdmin(req, res)) return undefined;
  try {
    const { data, error } = await buildFeedbackQuery(supabaseAdmin(), req.query);
    if (error) throw new Error(error.message);
    return sendJson(res, 200, { success: true, data: data ?? [] });
  } catch (error) {
    return sendJson(res, 500, { success: false, error: error instanceof Error ? error.message : "Could not load feedback." });
  }
}
