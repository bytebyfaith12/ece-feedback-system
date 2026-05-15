import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { roles } from "../../shared/constants.js";

const UserSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 120 },
    employeeId: { type: String, trim: true, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: roles, default: "Viewer" },
    site: { type: String, trim: true },
    accountDepartment: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

UserSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

export default mongoose.models.User || mongoose.model("User", UserSchema);
