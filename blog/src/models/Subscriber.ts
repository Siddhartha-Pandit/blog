import mongoose, { Schema, Document } from "mongoose";

export interface Subscriber extends Document {
  email: string;
  creatorId: mongoose.Schema.Types.ObjectId;
}

const SubscriberSchema = new Schema<Subscriber>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      index: true,
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

SubscriberSchema.index({ email: 1, creatorId: 1 }, { unique: true });

const SubscriberModel =
  mongoose.models.Subscriber as mongoose.Model<Subscriber> ||
  mongoose.model<Subscriber>("Subscriber", SubscriberSchema);
export default SubscriberModel;
