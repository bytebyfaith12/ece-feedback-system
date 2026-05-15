import { methodNotAllowed, readJson, sendJson, setAdminSession, stripHtml, verifyAdminPassword } from "../_utils.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res);
  try {
    const body = await readJson(req);
    const email = stripHtml(body.email || "admin@ece.echo").toLowerCase();
    const password = String(body.password || "");
    if (!password) throw new Error("Password is required.");
    const valid = await verifyAdminPassword(password);
    if (!valid) return sendJson(res, 401, { success: false, error: "Invalid admin credentials." });
    setAdminSession(res, email);
    return sendJson(res, 200, { success: true, data: { id: `admin-${email}`, email, name: email.split("@")[0] || "Admin", role: "Admin", loginTime: new Date().toISOString() } });
  } catch (error) {
    return sendJson(res, 400, { success: false, error: error instanceof Error ? error.message : "Could not sign in." });
  }
}
