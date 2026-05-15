import mongoose from "mongoose";

const AuditLogSchema = new mongoose.Schema(
  {
    actorUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    actorEmail: { type: String, default: "system" },
    action: { type: String, required: true },
    entity: { type: String, required: true },
    entityId: { type: String, default: "" },
    metadata: { type: Object, default: {} },
    ip: { type: String, default: "" },
  },
  { timestamps: true },
);

export default mongoose.models.AuditLog || mongoose.model("AuditLog", AuditLogSchema);
