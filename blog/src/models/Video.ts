//id,contentId, link

import mongoose, { Schema, Document } from "mongoose";

export interface Video extends Document{
    name: string;
    contentId: mongoose.Schema.Types.ObjectId;
    link: string
}

const VideoSchema = new Schema<Video>({
    name:{
        type: String,
        required: [true, "Category name is required"],
        trim: true,
        index: true
    },
    contentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Content",
    },
    link:{
        type: String,
        required: [true, "Link is required"],
    }
},{timestamps:true})

const VideoModel=mongoose.models.Video as mongoose.Model<Video> || mongoose.model<Video>("Video",VideoSchema);
export default VideoModel;