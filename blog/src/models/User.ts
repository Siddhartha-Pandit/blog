import mongoose, { Schema, Document, Model } from "mongoose";

export interface User extends Document {
  fullName: string;
  userName: string;
  email: string;
  password?: string;  // Made optional
  image?: string;     // Added image field
  bookmark: string[];
  followers: mongoose.Types.ObjectId[];
  provider?: string;
  providerId?: string;
}

const UserSchema: Schema<User> = new Schema<User>(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    userName: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      lowercase: true,
      match: [
        /^(?=.*[a-zA-Z])[a-zA-Z0-9_]+$/,
        "Invalid username format",
      ],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Invalid email format",
      ],
    },
    password: {
      type: String,
      required: false,  // No longer required
    },
    image: {
      type: String,
      default: "",
    },
    bookmark: {
      type: [String],
      default: [],
    },
    followers: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
    provider: {
      type: String,
      default: "",
    },
    providerId: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const UserModel: Model<User> =
  mongoose.models.User || mongoose.model<User>("User", UserSchema);

export default UserModel;