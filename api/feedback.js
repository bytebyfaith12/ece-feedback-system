import { enforceRateLimit, methodNotAllowed, readJson, sendJson, supabaseAdmin, validateFeedbackPayload } from "./_utils.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res);
  try {
    enforceRateLimit(req);
    const payload = await readJson(req);
    const row = validateFeedbackPayload(payload);
    const { data, error } = await supabaseAdmin().from("feedback").insert(row).select("*").single();
    if (error) throw new Error(error.message);
    return sendJson(res, 200, { success: true, data });
  } catch (error) {
    return sendJson(res, 400, { success: false, error: error instanceof Error ? error.message : "Feedback could not be submitted." });
  }
}
