//id, contentId, link
import mongoose, { Schema, Document } from "mongoose";

export interface Image extends Document{
    name: string;
    contentId: mongoose.Schema.Types.ObjectId;
    link: string
}

const ImageSchema = new Schema<Image>({
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

const ImageModel=mongoose.models.Image as mongoose.Model<Image> || mongoose.model<Image>("Image",ImageSchema);
export default ImageModel;