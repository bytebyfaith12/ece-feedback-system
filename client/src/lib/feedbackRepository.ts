import type { FeedbackResponse } from "@/types/index";
import type { FeedbackFilters, ProductionFeedbackInput, ProductionFeedbackRecord, ProductionFeedbackStatus } from "@/types/feedback";
import { feedbackInputSchema, ratingToSentiment, sanitizeFeedbackInput, validateAttachment } from "@/lib/feedbackValidation";
import { feedbackTypeLabels } from "@/types/feedback";
import { isSupabaseConfigured, requireSupabase } from "@/lib/supabaseClient";

const LOCAL_FEEDBACK_KEY = "ece-echo-production-feedback-local-v1";
const LOCAL_RATE_LIMIT_KEY = "ece-echo-feedback-rate-window-v1";
const ATTACHMENT_BUCKET = "feedback-attachments";
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX = 5;

type FeedbackRow = {
  id: string;
  submission_id: string;
  feedback_type: ProductionFeedbackRecord["feedbackType"];
  full_name: string;
  email: string | null;
  is_anonymous: boolean;
  site: ProductionFeedbackRecord["site"];
  floor: string | null;
  account: string | null;
  department: string | null;
  service_type: string | null;
  visit_purpose: string | null;
  person_visited: string | null;
  position_applied: string | null;
  recruitment_stage: string | null;
  operational_concern: string | null;
  rating: number;
  sentiment: ProductionFeedbackRecord["sentiment"];
  category: string;
  message: string;
  attachment_url: string | null;
  attachment_name: string | null;
  attachment_type: string | null;
  status: ProductionFeedbackStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
};

function canUseLocalFallback() {
  return !import.meta.env.PROD && !isSupabaseConfigured;
}

function requireConfiguredOrDevFallback() {
  if (!isSupabaseConfigured && !canUseLocalFallback()) {
    throw new Error("Feedback database is not configured for production. Add Supabase environment variables before accepting live submissions.");
  }
}

function submissionId() {
  const date = new Date();
  const stamp = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  return `ECE-${stamp}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

function readLocal(): ProductionFeedbackRecord[] {
  try {
    const raw = window.localStorage.getItem(LOCAL_FEEDBACK_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeLocal(records: ProductionFeedbackRecord[]) {
  window.localStorage.setItem(LOCAL_FEEDBACK_KEY, JSON.stringify(records));
}

function enforceClientRateLimit() {
  if (typeof window === "undefined") return;
  const now = Date.now();
  const raw = window.localStorage.getItem(LOCAL_RATE_LIMIT_KEY);
  let timestamps: number[] = [];
  try {
    timestamps = raw ? (JSON.parse(raw) as number[]).filter((value) => now - value < RATE_LIMIT_WINDOW_MS) : [];
  } catch {
    timestamps = [];
  }
  if (timestamps.length >= RATE_LIMIT_MAX) {
    throw new Error("Too many feedback submissions from this browser. Please try again later.");
  }
  window.localStorage.setItem(LOCAL_RATE_LIMIT_KEY, JSON.stringify([now, ...timestamps]));
}

function rowToRecord(row: FeedbackRow): ProductionFeedbackRecord {
  return {
    id: row.id,
    submissionId: row.submission_id,
    feedbackType: row.feedback_type,
    fullName: row.full_name,
    email: row.email ?? "",
    isAnonymous: row.is_anonymous,
    site: row.site,
    floor: row.floor ?? "",
    account: row.account ?? "",
    department: row.department ?? "",
    serviceType: row.service_type ?? "",
    visitPurpose: row.visit_purpose ?? "",
    personVisited: row.person_visited ?? "",
    positionApplied: row.position_applied ?? "",
    recruitmentStage: row.recruitment_stage ?? "",
    operationalConcern: row.operational_concern ?? "",
    rating: row.rating,
    sentiment: row.sentiment,
    category: row.category,
    message: row.message,
    attachmentUrl: row.attachment_url ?? undefined,
    attachmentName: row.attachment_name ?? undefined,
    attachmentType: row.attachment_type ?? undefined,
    status: row.status,
    adminNotes: row.admin_notes ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function recordToFeedbackResponse(record: ProductionFeedbackRecord): FeedbackResponse {
  const locationName = record.account || record.department || record.serviceType || record.visitPurpose || record.site;
  return {
    id: record.submissionId,
    submissionId: record.submissionId,
    feedbackType: record.feedbackType,
    sentiment: record.sentiment,
    locationId: `${record.site}-${locationName}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    locationName,
    site: record.site,
    siteId: record.site.toLowerCase(),
    siteName: record.site,
    floor: record.floor || "Site-wide",
    account: record.account || undefined,
    category: record.category,
    subcategory: feedbackTypeLabels[record.feedbackType],
    rating: record.rating as FeedbackResponse["rating"],
    priority: record.rating <= 2 ? "High" : "Low",
    status: record.status,
    assignedTeam: record.department || record.serviceType || record.category,
    source: "Web",
    comment: record.message,
    message: record.message,
    adminNotes: record.adminNotes,
    isAnonymous: record.isAnonymous,
    fullName: record.fullName,
    contact: record.email,
    respondentType: record.feedbackType === "visitor" ? "visitor" : record.feedbackType === "applicant" ? "applicant" : record.feedbackType === "service" ? "employee" : "employee",
    language: "EN",
    deviceId: "WEB-FORM",
    submittedAt: record.createdAt,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    sessionDuration: 0,
  };
}

export function productionRecordToFeedbackResponse(record: ProductionFeedbackRecord) {
  return recordToFeedbackResponse(record);
}

export function productionRecordsToFeedback(records: ProductionFeedbackRecord[]) {
  return records.map(recordToFeedbackResponse);
}

async function uploadAttachment(file: File, id: string) {
  const client = requireSupabase();
  const extension = file.name.split(".").pop() || "attachment";
  const path = `${id}/${crypto.randomUUID()}.${extension}`;
  const { error } = await client.storage.from(ATTACHMENT_BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw new Error(error.message);
  const { data } = client.storage.from(ATTACHMENT_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function createProductionFeedback(input: ProductionFeedbackInput, attachment?: File | null): Promise<ProductionFeedbackRecord> {
  requireConfiguredOrDevFallback();
  const validated = feedbackInputSchema.parse(input);
  const clean = sanitizeFeedbackInput(validated);
  const attachmentError = validateAttachment(attachment);
  if (attachmentError) throw new Error(attachmentError);
  enforceClientRateLimit();

  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const next: ProductionFeedbackRecord = {
    ...clean,
    id,
    submissionId: submissionId(),
    sentiment: ratingToSentiment(clean.rating),
    attachmentName: attachment?.name,
    attachmentType: attachment?.type,
    status: "New",
    adminNotes: "",
    createdAt: now,
    updatedAt: now,
  };

  if (!isSupabaseConfigured) {
    const records = [next, ...readLocal()];
    writeLocal(records);
    return next;
  }

  const attachmentUrl = attachment ? await uploadAttachment(attachment, next.submissionId) : undefined;
  const row = {
    submission_id: next.submissionId,
    feedback_type: next.feedbackType,
    full_name: next.fullName,
    email: next.email || null,
    is_anonymous: next.isAnonymous,
    site: next.site,
    floor: next.floor || null,
    account: next.account || null,
    department: next.department || null,
    service_type: next.serviceType || null,
    visit_purpose: next.visitPurpose || null,
    person_visited: next.personVisited || null,
    position_applied: next.positionApplied || null,
    recruitment_stage: next.recruitmentStage || null,
    operational_concern: next.operationalConcern || null,
    rating: next.rating,
    sentiment: next.sentiment,
    category: next.category,
    message: next.message,
    attachment_url: attachmentUrl ?? null,
    attachment_name: next.attachmentName ?? null,
    attachment_type: next.attachmentType ?? null,
    status: next.status,
    admin_notes: "",
  };

  const { data, error } = await requireSupabase().from("feedback_submissions").insert(row).select("*").single();
  if (error) throw new Error(error.message);
  return rowToRecord(data as FeedbackRow);
}

export async function listProductionFeedback(filters: FeedbackFilters = {}): Promise<ProductionFeedbackRecord[]> {
  requireConfiguredOrDevFallback();
  if (!isSupabaseConfigured) {
    return readLocal().filter((record) => {
      if (filters.site && record.site !== filters.site) return false;
      if (filters.feedbackType && record.feedbackType !== filters.feedbackType) return false;
      if (filters.category && record.category !== filters.category) return false;
      if (filters.rating && String(record.rating) !== filters.rating) return false;
      if (filters.sentiment && record.sentiment !== filters.sentiment) return false;
      if (filters.status && record.status !== filters.status) return false;
      if (filters.search) {
        const haystack = `${record.submissionId} ${record.fullName} ${record.email} ${record.site} ${record.account} ${record.category} ${record.message}`.toLowerCase();
        if (!haystack.includes(filters.search.toLowerCase())) return false;
      }
      return true;
    });
  }

  let query = requireSupabase().from("feedback_submissions").select("*").order("created_at", { ascending: false });
  if (filters.site) query = query.eq("site", filters.site);
  if (filters.floor) query = query.eq("floor", filters.floor);
  if (filters.account) query = query.eq("account", filters.account);
  if (filters.category) query = query.eq("category", filters.category);
  if (filters.feedbackType) query = query.eq("feedback_type", filters.feedbackType);
  if (filters.rating) query = query.eq("rating", Number(filters.rating));
  if (filters.sentiment) query = query.eq("sentiment", filters.sentiment);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.dateFrom) query = query.gte("created_at", filters.dateFrom);
  if (filters.dateTo) query = query.lte("created_at", filters.dateTo);
  if (filters.search) query = query.or(`submission_id.ilike.%${filters.search}%,full_name.ilike.%${filters.search}%,message.ilike.%${filters.search}%`);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return ((data ?? []) as FeedbackRow[]).map(rowToRecord);
}

export async function updateProductionFeedbackStatus(id: string, status: ProductionFeedbackStatus, adminNotes = "") {
  requireConfiguredOrDevFallback();
  if (!isSupabaseConfigured) {
    const records = readLocal().map((record) => (record.submissionId === id || record.id === id ? { ...record, status, adminNotes, updatedAt: new Date().toISOString() } : record));
    writeLocal(records);
    return records.find((record) => record.submissionId === id || record.id === id) ?? null;
  }

  const key = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id) ? "id" : "submission_id";
  const { data, error } = await requireSupabase()
    .from("feedback_submissions")
    .update({ status, admin_notes: adminNotes, updated_at: new Date().toISOString() })
    .eq(key, id)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return rowToRecord(data as FeedbackRow);
}

export function isProductionDatabaseConfigured() {
  return isSupabaseConfigured;
}
