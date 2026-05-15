import mongoose from "mongoose";

const FloorSchema = new mongoose.Schema(
  {
    site: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    accounts: [{ type: String, trim: true }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.models.Floor || mongoose.model("Floor", FloorSchema);
