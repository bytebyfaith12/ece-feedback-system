import { allowedStatuses, methodNotAllowed, readJson, requireAdmin, sendJson, stripHtml, supabaseAdmin } from "../../_utils.js";

export default async function handler(req, res) {
  if (req.method !== "PATCH") return methodNotAllowed(res);
  if (!requireAdmin(req, res)) return undefined;
  try {
    const id = stripHtml(req.query.id || "");
    const body = await readJson(req);
    const status = stripHtml(body.status || "");
    const adminNotes = stripHtml(body.adminNotes || "");
    if (!allowedStatuses.includes(status)) throw new Error("Choose a valid status.");
    const key = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id) ? "id" : "submission_id";
    const { data, error } = await supabaseAdmin().from("feedback").update({ status, admin_notes: adminNotes }).eq(key, id).select("*").single();
    if (error) throw new Error(error.message);
    return sendJson(res, 200, { success: true, data });
  } catch (error) {
    return sendJson(res, 400, { success: false, error: error instanceof Error ? error.message : "Could not update feedback." });
  }
}
