import fs from "fs/promises";
import path from "path";
import bcrypt from "bcryptjs";
import xss from "xss";
import crypto from "crypto";
import { env } from "../config/env.js";
import { isMongoConnected } from "../config/database.js";
import User from "../models/User.js";
import Feedback from "../models/Feedback.js";
import AuditLog from "../models/AuditLog.js";
import { inferAssignedTeam, ratings } from "../../shared/constants.js";

const dataDir = path.join(env.rootDir, ".data");
const dataFile = path.join(dataDir, "ece-pulse-db.json");

const emptyDb = {
  users: [],
  feedback: [],
  auditLogs: [],
};

function sanitizeValue(value) {
  if (typeof value !== "string") return value;
  return xss(value.trim());
}

function sanitizeObject(input) {
  return Object.fromEntries(Object.entries(input || {}).map(([key, value]) => [key, sanitizeValue(value)]));
}

function toPublicUser(user) {
  if (!user) return null;
  const plain = user.toObject ? user.toObject() : user;
  const safe = { ...plain };
  delete safe.passwordHash;
  return {
    ...safe,
    id: String(safe._id || safe.id),
  };
}

function normalize(doc) {
  if (!doc) return null;
  const plain = doc.toObject ? doc.toObject() : doc;
  return {
    ...plain,
    id: String(plain._id || plain.id),
  };
}

async function ensureLocalDb() {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(dataFile);
  } catch {
    await fs.writeFile(dataFile, JSON.stringify(emptyDb, null, 2));
  }
}

async function readLocalDb() {
  await ensureLocalDb();
  const raw = await fs.readFile(dataFile, "utf8");
  return { ...emptyDb, ...JSON.parse(raw) };
}

async function writeLocalDb(db) {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(dataFile, JSON.stringify(db, null, 2));
}

function matchesFeedbackFilters(item, filters = {}) {
  const created = new Date(item.createdAt || item.dateTimeSubmitted);
  if (filters.site && item.site !== filters.site) return false;
  if (filters.floor && item.floor !== filters.floor) return false;
  if (filters.account && item.accountDepartment !== filters.account) return false;
  if (filters.category && item.category !== filters.category) return false;
  if (filters.status && item.status !== filters.status) return false;
  if (filters.dateFrom && created < new Date(filters.dateFrom)) return false;
  if (filters.dateTo) {
    const end = new Date(filters.dateTo);
    end.setHours(23, 59, 59, 999);
    if (created > end) return false;
  }
  if (filters.search) {
    const haystack = `${item.feedbackId} ${item.fullName} ${item.employeeOrVisitorId} ${item.site} ${item.floor} ${item.accountDepartment} ${item.category} ${item.comment}`.toLowerCase();
    if (!haystack.includes(String(filters.search).toLowerCase())) return false;
  }
  return true;
}

export async function createUser(payload) {
  const clean = sanitizeObject(payload);
  const passwordHash = await bcrypt.hash(clean.password, 12);

  if (isMongoConnected) {
    const user = await User.create({
      fullName: clean.fullName,
      employeeId: clean.employeeId || "",
      email: clean.email,
      passwordHash,
      role: clean.role || "Viewer",
      site: clean.site || "",
      accountDepartment: clean.accountDepartment || "",
    });
    return toPublicUser(user);
  }

  const db = await readLocalDb();
  if (db.users.some((user) => user.email === clean.email.toLowerCase())) {
    const error = new Error("Email is already registered.");
    error.status = 409;
    throw error;
  }

  const user = {
    id: crypto.randomUUID(),
    fullName: clean.fullName,
    employeeId: clean.employeeId || "",
    email: clean.email.toLowerCase(),
    passwordHash,
    role: clean.role || "Viewer",
    site: clean.site || "",
    accountDepartment: clean.accountDepartment || "",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  db.users.push(user);
  await writeLocalDb(db);
  return toPublicUser(user);
}

export async function findUserByEmail(email) {
  if (isMongoConnected) return User.findOne({ email: email.toLowerCase(), isActive: true });
  const db = await readLocalDb();
  return db.users.find((user) => user.email === email.toLowerCase() && user.isActive) || null;
}

export async function findUserById(id) {
  if (!id) return null;
  if (isMongoConnected) return User.findById(id);
  const db = await readLocalDb();
  return db.users.find((user) => user.id === id) || null;
}

export async function listUsers() {
  if (isMongoConnected) {
    const users = await User.find().sort({ createdAt: -1 });
    return users.map(toPublicUser);
  }
  const db = await readLocalDb();
  return db.users.map(toPublicUser).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function updateUser(id, updates) {
  const clean = sanitizeObject(updates);
  if (isMongoConnected) {
    const user = await User.findByIdAndUpdate(id, clean, { new: true });
    return toPublicUser(user);
  }
  const db = await readLocalDb();
  const index = db.users.findIndex((user) => user.id === id);
  if (index === -1) return null;
  db.users[index] = { ...db.users[index], ...clean, updatedAt: new Date().toISOString() };
  await writeLocalDb(db);
  return toPublicUser(db.users[index]);
}

export async function createFeedback(payload, context = {}) {
  const clean = sanitizeObject(payload);
  const ratingConfig = ratings.find((item) => item.label === clean.rating);
  const now = new Date();
  const feedbackId = `ECE-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(Date.now()).slice(-6)}`;
  const record = {
    feedbackId,
    fullName: clean.fullName,
    employeeOrVisitorId: clean.employeeOrVisitorId,
    role: clean.role,
    site: clean.site,
    floor: clean.floor,
    accountDepartment: clean.accountDepartment,
    category: clean.category,
    rating: clean.rating,
    ratingScore: ratingConfig?.score || Number(clean.ratingScore || 0),
    comment: clean.comment || "",
    attachmentUrl: clean.attachmentUrl || "",
    deviceKioskId: clean.deviceKioskId || "",
    submittedByUserId: context.userId || null,
    status: "New",
    assignedTeam: inferAssignedTeam(clean.category),
    adminNotes: "",
    resolutionNotes: "",
  };

  if (isMongoConnected) {
    const created = await Feedback.create(record);
    return normalize(created);
  }

  const db = await readLocalDb();
  const localRecord = {
    id: crypto.randomUUID(),
    ...record,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
  db.feedback.push(localRecord);
  await writeLocalDb(db);
  return localRecord;
}

export async function listFeedback(filters = {}) {
  if (isMongoConnected) {
    const query = {};
    if (filters.site) query.site = filters.site;
    if (filters.floor) query.floor = filters.floor;
    if (filters.account) query.accountDepartment = filters.account;
    if (filters.category) query.category = filters.category;
    if (filters.status) query.status = filters.status;
    if (filters.dateFrom || filters.dateTo) {
      query.createdAt = {};
      if (filters.dateFrom) query.createdAt.$gte = new Date(filters.dateFrom);
      if (filters.dateTo) {
        const end = new Date(filters.dateTo);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }
    if (filters.search) {
      query.$or = [
        { feedbackId: { $regex: filters.search, $options: "i" } },
        { fullName: { $regex: filters.search, $options: "i" } },
        { comment: { $regex: filters.search, $options: "i" } },
      ];
    }
    const records = await Feedback.find(query).sort({ createdAt: -1 });
    return records.map(normalize);
  }

  const db = await readLocalDb();
  return db.feedback.filter((item) => matchesFeedbackFilters(item, filters)).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function getFeedback(id) {
  if (isMongoConnected) {
    const filters = [{ feedbackId: id }];
    if (id.match(/^[a-f\d]{24}$/i)) filters.push({ _id: id });
    const record = await Feedback.findOne({ $or: filters });
    return normalize(record);
  }
  const db = await readLocalDb();
  return db.feedback.find((item) => item.id === id || item.feedbackId === id) || null;
}

export async function updateFeedback(id, updates) {
  const clean = sanitizeObject(updates);
  const allowed = ["status", "assignedTeam", "adminNotes", "resolutionNotes"];
  const patch = Object.fromEntries(Object.entries(clean).filter(([key]) => allowed.includes(key)));

  if (isMongoConnected) {
    const filters = [{ feedbackId: id }];
    if (id.match(/^[a-f\d]{24}$/i)) filters.push({ _id: id });
    const record = await Feedback.findOneAndUpdate({ $or: filters }, patch, { new: true });
    return normalize(record);
  }

  const db = await readLocalDb();
  const index = db.feedback.findIndex((item) => item.id === id || item.feedbackId === id);
  if (index === -1) return null;
  db.feedback[index] = { ...db.feedback[index], ...patch, updatedAt: new Date().toISOString() };
  await writeLocalDb(db);
  return db.feedback[index];
}

export async function archiveFeedback(id) {
  return updateFeedback(id, { status: "Archived" });
}

export async function addAuditLog({ actor, action, entity, entityId = "", metadata = {}, ip = "" }) {
  const payload = {
    actorUserId: actor?.id || actor?._id || null,
    actorEmail: actor?.email || "system",
    action,
    entity,
    entityId,
    metadata,
    ip,
  };
  if (isMongoConnected) return AuditLog.create(payload);
  const db = await readLocalDb();
  db.auditLogs.push({ id: crypto.randomUUID(), ...payload, createdAt: new Date().toISOString() });
  await writeLocalDb(db);
  return payload;
}

export async function listAuditLogs() {
  if (isMongoConnected) {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(200);
    return logs.map(normalize);
  }
  const db = await readLocalDb();
  return db.auditLogs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 200);
}

export async function verifyPassword(user, password) {
  if (!user) return false;
  if (user.comparePassword) return user.comparePassword(password);
  return bcrypt.compare(password, user.passwordHash);
}

export function publicUser(user) {
  return toPublicUser(user);
}
