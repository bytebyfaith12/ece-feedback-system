import { clearAdminSession, methodNotAllowed, sendJson } from "../_utils.js";

export default function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res);
  clearAdminSession(res);
  return sendJson(res, 200, { success: true, data: { loggedOut: true } });
}
