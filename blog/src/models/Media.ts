import mongoose, { Schema, Document } from "mongoose";

export interface Media extends Document{
    name: string;
    contentId: mongoose.Schema.Types.ObjectId;
    link: string
}

const MediaSchema = new Schema<Media>({
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

const MediaModel=mongoose.models.Media as mongoose.Model<Media> || mongoose.model<Media>("Media",MediaSchema);
export default MediaModel;