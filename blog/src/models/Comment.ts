//  reply
import mongoose, { Schema, Document } from "mongoose";

export interface Comment extends Document{
    comment: string;
    likes: Number;
    commentDate: Date;
    contentId: mongoose.Schema.Types.ObjectId;
    userId: mongoose.Schema.Types.ObjectId;
    reply: mongoose.Schema.Types.ObjectId;
}

const CommentSchema = new Schema<Comment>({
    comment:{
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
    contentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Content",
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    reply:[{
       type: mongoose.Schema.Types.ObjectId,
        ref: "Reply"
    }]

},{timestamps:true})

const CommentModel=mongoose.models.Content as mongoose.Model<Comment> || mongoose.model<Comment>("Comment",CommentSchema);
export default CommentModel;