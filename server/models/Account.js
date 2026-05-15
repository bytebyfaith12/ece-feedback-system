import mongoose from "mongoose";

const AccountSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    department: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.models.Account || mongoose.model("Account", AccountSchema);
