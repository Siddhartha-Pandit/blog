//userid, fullname,username, email, password, bookmark, followers
import mongoose,{Schema,Document} from "mongoose";
export interface User extends Document{
    fullName: string;
    userName: string;
}

const UserSchema = new Schema<User>({
    fullName:{
        type: String,
        required: [false,"Full name is required"],
        trim: true,
        index: true
    },
    userName:{
        type: String,
        required: [true,"Username is required"],
        lowercase: true,
        unique: true,
        match: [/^(?=.*[a-zA-Z])[a-zA-Z0-9_]+$/, "Please use a valid username"]
    }
},{timestamps:true})

 const UserModel= mongoose.models.User as mongoose.Model<User> || mongoose.model<User>("User",UserSchema)
 export default UserModel;