import mongoose, { Schema, Document, Model } from "mongoose";
import { IUser } from "./user.model";

export interface IDocument extends Document {
  userId: mongoose.Types.ObjectId | IUser;
  title: string;
  content: string;
  coverImage?: string;
  icon?: string;
  isArchived: boolean;
  isPublished: boolean;
  parentDocument: mongoose.Types.ObjectId | IDocument | null;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema<IDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    coverImage: { type: String },
    icon: { type: String },
    isArchived: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: false },
    parentDocument: { type: Schema.Types.ObjectId, ref: "Document", default: null },
  },
  { timestamps: true }
);

DocumentSchema.index({ userId: 1 });
DocumentSchema.index({ userId: 1, parentDocument: 1 });

export const DocumentModel: Model<IDocument> =
  mongoose.models.Document || mongoose.model("Document", DocumentSchema);
