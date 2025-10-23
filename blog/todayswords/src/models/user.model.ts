import mongoose, { Schema, Document, Model } from "mongoose";

// User interface
export interface IUser extends Document {
  name: string;
  email: string;
  image?: string;
  role: "admin" | "member";
  userName: string;
  createdAt: Date;
  updatedAt: Date;
}

// User schema
const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image: { type: String },
    role: { type: String, enum: ["admin", "member"], default: "member" },
    userName: { type: String, unique: true, required: true, sparse: true },
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
