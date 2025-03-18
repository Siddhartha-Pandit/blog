//id, email, creatorId

import mongoose, { Schema, Document } from "mongoose";

export interface Subscriber extends Document{
    email: string;
    creatorId: mongoose.Schema.Types.ObjectId;
}

const SubscriberSchema = new Schema<Subscriber>({
    email:{
        type: String,
        required: [true, "Category name is required"],
        trim: true,
        index: true
    },
    creatorId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }]
},{timestamps:true})

const SubscriberModel=mongoose.models.Subscriber as mongoose.Model<Subscriber> || mongoose.model<Subscriber>("Subscriber",SubscriberSchema);
export default SubscriberModel;