import mongoose from "mongoose";

const SiteSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.models.Site || mongoose.model("Site", SiteSchema);
