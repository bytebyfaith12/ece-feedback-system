import mongoose from "mongoose";

const KioskSchema = new mongoose.Schema(
  {
    kioskId: { type: String, required: true, unique: true, trim: true },
    site: { type: String, required: true, trim: true },
    floor: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
    lastSeenAt: { type: Date },
  },
  { timestamps: true },
);

export default mongoose.models.Kiosk || mongoose.model("Kiosk", KioskSchema);
