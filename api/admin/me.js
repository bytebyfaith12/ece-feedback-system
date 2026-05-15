import { getAdminSession, methodNotAllowed, sendJson } from "../_utils.js";

export default function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res);
  const session = getAdminSession(req);
  return sendJson(res, 200, { success: true, data: session ? { id: `admin-${session.email}`, email: session.email, name: session.email.split("@")[0] || "Admin", role: "Admin", loginTime: new Date().toISOString() } : null });
}
