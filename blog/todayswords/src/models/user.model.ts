import mongoose, { Schema, Document, Model } from "mongoose";
import { ITenant } from "./tenant.model";

// Define the interface for User model
export interface IUser extends Document {
  name: string;
  email: string;
  image?: string;
  tenantId: mongoose.Types.ObjectId | ITenant;
  role: "admin" | "member";
  userName: string; // Add userName as a required field
  createdAt: Date;
}

// Define the User schema
const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image: { type: String },
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true },
    role: { type: String, enum: ["admin", "member"], default: "member" },
    userName: { type: String, unique: true, required: true, sparse: true }, // Add unique userName field
  },
  { timestamps: true }
);

// Ensure that the `userName` field is generated and handled correctly in the database
// We use `sparse: true` to allow for null values if you don't want to create unique constraints for those.

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
