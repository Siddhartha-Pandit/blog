import mongoose, { Schema, Document, Model } from "mongoose";

export interface User extends Document {
  fullName: string;
  userName: string;
  email: string;
  password?: string;
  image?: string;
  bookmarks: mongoose.Types.ObjectId[]; // References to Content documents
  followers: mongoose.Types.ObjectId[];
  following: mongoose.Types.ObjectId[]; // References to User documents (similar to followers)
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
      required: false,
    },
    image: {
      type: String,
      default: "",
    },
    bookmarks: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Content", // Each bookmark is a reference to a Content document
      default: [],
    },
    followers: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
    following: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User", // Each following is a reference to a User document
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
