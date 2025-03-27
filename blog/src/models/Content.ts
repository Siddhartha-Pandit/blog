import mongoose,{Schema,Document} from "mongoose";

export interface Content extends Document{
    title: string;
    contentBody: string;
    author: mongoose.Schema.Types.ObjectId;
    shares: number;
    likes: Schema.Types.ObjectId[];
    tags: string[];
    isPublished: boolean;
    category: mongoose.Schema.Types.ObjectId;
    publishDateTime: Date;
}

const ContentSchema = new Schema<Content>({
    title: {
        type: String,
        required: [true, "Title iis required"],
        trim: true
    },
    contentBody:{
        type: String,
        required: false
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    category:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
    },
    shares:{
        type: Number,
        default:0
    },
    likes: [{
        type:mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    tags: [
        {
          type: String,
        },
      ],
    isPublished:{
        type: Boolean,
        default: false
    },
    publishDateTime:{
        type: Date,
        default: Date.now
    }

},{timestamps:true})

const ContentModel=mongoose.models.Content as mongoose.Model<Content> || mongoose.model<Content>("Content",ContentSchema);
export default ContentModel;