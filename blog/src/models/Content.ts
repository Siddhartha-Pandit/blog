import mongoose, { Schema, Document, model, models } from "mongoose";

export interface Content extends Document {
  title: string;
  content: string;                    // renamed from contentBody
  author: mongoose.Schema.Types.ObjectId;
  category?: mongoose.Schema.Types.ObjectId; // now optional
  tags: string[];
  featureImage: string;
  metaDescription: string;
  shares: number;
  likes: mongoose.Schema.Types.ObjectId[];
  isPublished: boolean;
  publishDateTime: Date | null;       // allow null for drafts
}

const ContentSchema: Schema<Content> = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      // no longer required for drafts
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    featureImage: {
      type: String,
      required: [true, "Feature image URL is required"],
      trim: true,
    },
    metaDescription: {
      type: String,
      required: [true, "Meta description is required"],
      maxlength: [160, "Meta description cannot exceed 160 characters"],
      trim: true,
    },
    shares: {
      type: Number,
      default: 0,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishDateTime: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const ContentModel = models.Content || model<Content>("Content", ContentSchema);

export default ContentModel;
