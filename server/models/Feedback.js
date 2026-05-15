import mongoose from "mongoose";
import { assignedTeams, feedbackCategories, feedbackStatuses, ratings } from "../../shared/constants.js";

const FeedbackSchema = new mongoose.Schema(
  {
    feedbackId: { type: String, required: true, unique: true, index: true },
    fullName: { type: String, required: true, trim: true, maxlength: 120 },
    employeeOrVisitorId: { type: String, required: true, trim: true, maxlength: 100 },
    role: { type: String, required: true, trim: true, maxlength: 80 },
    site: { type: String, required: true, trim: true },
    floor: { type: String, required: true, trim: true },
    accountDepartment: { type: String, required: true, trim: true },
    category: { type: String, required: true, enum: feedbackCategories },
    rating: { type: String, required: true, enum: ratings.map((item) => item.label) },
    ratingScore: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 2000, default: "" },
    attachmentUrl: { type: String, default: "" },
    deviceKioskId: { type: String, default: "" },
    submittedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    status: { type: String, enum: feedbackStatuses, default: "New" },
    assignedTeam: { type: String, enum: assignedTeams, required: true },
    adminNotes: { type: String, default: "" },
    resolutionNotes: { type: String, default: "" },
  },
  { timestamps: true },
);

export default mongoose.models.Feedback || mongoose.model("Feedback", FeedbackSchema);
