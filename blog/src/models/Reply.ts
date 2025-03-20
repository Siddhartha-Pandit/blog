//id, reply, like, replyId (reply yo reply),userId
import mongoose, { Schema, Document } from "mongoose";

export interface Reply extends Document{
    reply: string;
    likes: number;
    commentDate: Date;
    replyId: mongoose.Schema.Types.ObjectId;
    userId: mongoose.Schema.Types.ObjectId;
}

const ReplySchema = new Schema<Reply>({
    reply:{
        type: String,
        required: true
    },
    likes:{
        type: Number,
        default:0
    },
    commentDate:{
        type: Date,
        default: Date.now
    },
    replyId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Reply",
    }],
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
   

},{timestamps:true})

const ReplyModel=mongoose.models.Reply as mongoose.Model<Reply> || mongoose.model<Reply>("Reply",ReplySchema);
export default ReplyModel;