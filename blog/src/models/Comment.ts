import mongoose, { Schema, Document, Types } from "mongoose";

export interface CommentDoc extends Document {
  comment: string;
  likes: Types.ObjectId[];
  commentDate: Date;
  contentId: Types.ObjectId;
  userId: Types.ObjectId;
  reply: Array<Types.ObjectId | CommentDoc>;
}

const CommentSchema = new Schema<CommentDoc>(
  {
    comment: {
      type: String,
      required: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    commentDate: {
      type: Date,
      default: Date.now,
    },
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Content",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reply: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },
  { timestamps: true }
);

const CommentModel =
  (mongoose.models.Comment as mongoose.Model<CommentDoc>) ||
  mongoose.model<CommentDoc>("Comment", CommentSchema);

export default CommentModel;
