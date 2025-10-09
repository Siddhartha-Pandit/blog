// /models/user.model.ts
import mongoose, { Schema, Document, Model } from "mongoose";
import { ITenant } from "./tenant.model";

export interface IUser extends Document {
  name: string;
  email: string;
  image?: string;
  tenantId: mongoose.Types.ObjectId | ITenant;
  role: "admin" | "member";
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image: { type: String },
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true },
    role: { type: String, enum: ["admin", "member"], default: "member" },
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model("User", UserSchema);
