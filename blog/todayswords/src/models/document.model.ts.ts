// /models/document.model.ts
import mongoose, { Schema, Document, Model } from "mongoose";
import { ITenant } from "./tenant.model";
import { IUser } from "./user.model";

export interface IDocument extends Document {
  tenantId: mongoose.Types.ObjectId | ITenant;
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
    tenantId: { type: Schema.Types.ObjectId, ref: "Tenant", required: true },
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

export const DocumentModel: Model<IDocument> =
  mongoose.models.Document || mongoose.model("Document", DocumentSchema);
