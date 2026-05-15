import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    filters: { type: Object, default: {} },
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    exportType: { type: String, enum: ["csv", "pdf", "print", "summary"], default: "summary" },
  },
  { timestamps: true },
);

export default mongoose.models.Report || mongoose.model("Report", ReportSchema);
