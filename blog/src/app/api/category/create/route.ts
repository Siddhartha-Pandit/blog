import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import CategoryModel from "@/models/Category";
import { ApiResponse } from "@/lib/ApiResponse";
import { ApiError } from "@/lib/ApiError";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
export async function POST(request:Request){
    console.debug("Received POST request to create a new blog post.");
    const session = await getServerSession(authOptions);
    console.log("sessions in routes.ts at blog->create",session)
    if (!session) {
      console.error("Unauthorized request: No session found.");
      return NextResponse.json(new ApiError(401, "User is unauthorized"), { status: 401 });
    } 
    console.debug("Authenticated user:", session.user.id);
    const allowedUserId = process.env.ALLOWED_USER;
    if(session.user.id !== allowedUserId){
        console.error("Forbidden request: User is not allowed.");
        return NextResponse.json(
            new ApiError(403, "Forbidden: You are not allowed to create a blog post."),
            { status: 403 }
          );
   }
   console.debug("Autheticated user: ",session.user.id);

   try{
    const {name} =await request.json()
    if(!name){
        console.error("Validation failed: Missing required fields.");
        return NextResponse.json(
            new ApiError(400,"Name is required"),
            {status:400}
        );
    }
    await dbConnect();
    console.debug("Database connected");
    const newCategory=new CategoryModel({
        name
    })
    console.debug("New category constructed:", newCategory);
    const savedCategory=await newCategory.save();
    console.debug("save category",savedCategory);
    if(savedCategory._id){
        console.debug("category created successfully with id:",savedCategory._id);
        return NextResponse.json(new ApiResponse(201, savedCategory, "Blog created successfully"), { status: 201 });
    }
     console.error("Failed to save the blog category. No _id returned.");
          return NextResponse.json(new ApiError(500, "Couldn't save the category."), { status: 500 });
   }
   catch(error){
    console.error("Error creating categoty post:", error);
    return NextResponse.json(new ApiError(500, "Error creating category post"), { status: 500 });
   }
}