import mongoose, { Schema, Document } from "mongoose";

export interface Category extends Document{
    name: string;
   
}

const CategorySchema = new Schema<Category>({
    name:{
        type: String,
        required: [true, "Category name is required"],
        unique: true,
        trim: true,
        index: true
    }
},{timestamps:true})

CategorySchema.pre("save", function (next) {
    if (this.isModified("name")) {
      this.name = this.name.toUpperCase();
    }
    next();
  });

const CategoryModel=mongoose.models.Category as mongoose.Model<Category> || mongoose.model<Category>("Category",CategorySchema);
export default CategoryModel;