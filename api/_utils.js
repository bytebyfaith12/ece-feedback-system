import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const feedbackTypes = ["workplace", "service", "visitor", "applicant", "account"];
const sites = ["Noel", "Macias", "Consuelo"];
const sentiments = ["very_negative", "negative", "neutral", "positive", "very_positive"];
const statuses = ["new", "reviewed", "in_progress", "resolved", "archived"];
const allowedAttachmentTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const rateLimitBuckets = new Map();

export function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

export function methodNotAllowed(res) {
  sendJson(res, 405, { success: false, error: "Method not allowed" });
}

export async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error("Request body must be valid JSON.");
  }
}

export function supabaseAdmin() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Supabase server credentials are not configured.");
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function stripHtml(value = "") {
  return String(value).replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

export function ratingToSentiment(rating) {
  if (rating === 5) return "very_positive";
  if (rating === 4) return "positive";
  if (rating === 3) return "neutral";
  if (rating === 2) return "negative";
  return "very_negative";
}

export function validateFeedbackPayload(payload) {
  const feedbackType = stripHtml(payload.feedbackType);
  const site = stripHtml(payload.site);
  const rating = Number(payload.rating);
  const isAnonymous = Boolean(payload.isAnonymous);
  const fullName = isAnonymous ? "Anonymous" : stripHtml(payload.fullName);
  const email = stripHtml(payload.email || "").toLowerCase();
  const message = stripHtml(payload.message);
  const category = stripHtml(payload.category);

  if (!feedbackTypes.includes(feedbackType)) throw new Error("Choose a valid feedback type.");
  if (!sites.includes(site)) throw new Error("Choose a valid site.");
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new Error("Rating must be an integer from 1 to 5.");
  if (!isAnonymous && fullName.length < 2) throw new Error("Full name is required unless anonymous is enabled.");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid email address.");
  if (!category || category.length > 140) throw new Error("Choose a valid category.");
  if (message.length < 10 || message.length > 500) throw new Error("Message must be 10 to 500 characters.");
  if (payload.attachmentType && !allowedAttachmentTypes.includes(payload.attachmentType)) throw new Error("Only JPG, PNG, WebP, and PDF attachments are allowed.");

  return {
    feedback_type: feedbackType,
    full_name: fullName,
    email: email || null,
    is_anonymous: isAnonymous,
    site,
    floor: stripHtml(payload.floor || "") || null,
    account: stripHtml(payload.account || "") || null,
    department: stripHtml(payload.department || "") || null,
    service_type: stripHtml(payload.serviceType || "") || null,
    staff_involved: stripHtml(payload.staffInvolved || "") || null,
    visit_purpose: stripHtml(payload.visitPurpose || "") || null,
    person_visited: stripHtml(payload.personVisited || "") || null,
    position_applied: stripHtml(payload.positionApplied || "") || null,
    recruitment_stage: stripHtml(payload.recruitmentStage || "") || null,
    operational_concern: stripHtml(payload.operationalConcern || "") || null,
    rating,
    sentiment: ratingToSentiment(rating),
    category,
    message,
    attachment_url: stripHtml(payload.attachmentUrl || "") || null,
    attachment_name: stripHtml(payload.attachmentName || "") || null,
    attachment_type: stripHtml(payload.attachmentType || "") || null,
    status: "new",
    admin_notes: "",
  };
}

export function getIp(req) {
  return String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown").split(",")[0].trim();
}

export function enforceRateLimit(req, max = 5, windowMs = 60 * 60 * 1000) {
  const ip = getIp(req);
  const now = Date.now();
  const bucket = (rateLimitBuckets.get(ip) || []).filter((timestamp) => now - timestamp < windowMs);
  if (bucket.length >= max) {
    throw new Error("Too many feedback submissions. Please try again later.");
  }
  bucket.push(now);
  rateLimitBuckets.set(ip, bucket);
}

function parseCookies(req) {
  return Object.fromEntries(
    String(req.headers.cookie || "")
      .split(";")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        const index = item.indexOf("=");
        return [item.slice(0, index), decodeURIComponent(item.slice(index + 1))];
      }),
  );
}

function sessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("SESSION_SECRET must be at least 32 characters.");
  return secret;
}

function sign(value) {
  return crypto.createHmac("sha256", sessionSecret()).update(value).digest("base64url");
}

export function setAdminSession(res, email) {
  const payload = Buffer.from(JSON.stringify({ email, role: "admin", exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })).toString("base64url");
  const token = `${payload}.${sign(payload)}`;
  res.setHeader("Set-Cookie", `ece_echo_admin=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800`);
}

export function clearAdminSession(res) {
  res.setHeader("Set-Cookie", "ece_echo_admin=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0");
}

export function getAdminSession(req) {
  const token = parseCookies(req).ece_echo_admin;
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature || sign(payload) !== signature) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (session.role !== "admin" || Date.now() > session.exp) return null;
    return session;
  } catch {
    return null;
  }
}

export function requireAdmin(req, res) {
  const session = getAdminSession(req);
  if (!session) {
    sendJson(res, 401, { success: false, error: "Unauthorized" });
    return null;
  }
  return session;
}

export async function verifyAdminPassword(password) {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!hash) throw new Error("ADMIN_PASSWORD_HASH is not configured.");
  return bcrypt.compare(password, hash);
}

export function buildFeedbackQuery(client, queryParams = {}) {
  let query = client.from("feedback").select("*").order("created_at", { ascending: false });
  const simpleFilters = {
    site: "site",
    floor: "floor",
    account: "account",
    category: "category",
    feedbackType: "feedback_type",
    sentiment: "sentiment",
    status: "status",
  };
  Object.entries(simpleFilters).forEach(([param, column]) => {
    if (queryParams[param]) query = query.eq(column, queryParams[param]);
  });
  if (queryParams.rating) query = query.eq("rating", Number(queryParams.rating));
  if (queryParams.dateFrom) query = query.gte("created_at", queryParams.dateFrom);
  if (queryParams.dateTo) query = query.lte("created_at", queryParams.dateTo);
  if (queryParams.search) {
    const search = String(queryParams.search).replace(/[%(),]/g, "");
    query = query.or(`submission_id.ilike.%${search}%,full_name.ilike.%${search}%,message.ilike.%${search}%`);
  }
  return query;
}

export function feedbackCsv(rows) {
  const headers = ["Submission ID", "Feedback Type", "Full Name", "Email", "Site", "Floor", "Account", "Department", "Rating", "Sentiment", "Message", "Status", "Admin Notes", "Submitted At"];
  const escapeCsv = (value) => {
    const text = String(value ?? "");
    return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const body = rows.map((row) => [
    row.submission_id,
    row.feedback_type,
    row.is_anonymous ? "Anonymous" : row.full_name,
    row.email,
    row.site,
    row.floor,
    row.account,
    row.department || row.staff_involved || row.service_type,
    row.rating,
    row.sentiment,
    row.message,
    row.status,
    row.admin_notes,
    row.created_at,
  ]);
  return [headers, ...body].map((row) => row.map(escapeCsv).join(",")).join("\n");
}

export const allowedStatuses = statuses;
export const allowedSentiments = sentiments;
