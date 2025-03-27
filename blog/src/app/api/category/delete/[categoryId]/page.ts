import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import CategoryModel from "@/models/Category";
import { ApiResponse } from "@/lib/ApiResponse";
import { ApiError } from "@/lib/ApiError";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/authOptions";

export async function DELETE(req:Request,
    { params }: { params: { categoryId: string } }
){
    console.debug("Received DELETE request to create a new blog post.");
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
   
    await dbConnect();
    console.debug("Database connected");
    const category=CategoryModel.findById(params.categoryId);
    console.debug(" category found:", category);
    await category.deleteOne();
    console.debug(" category deleted");
    
        console.debug("category deleted successfully with id:");
        return NextResponse.json(new ApiResponse(201, null, "Blog deleted successfully"), { status: 201 });
   }
   catch(error){
    console.error("Error creating categoty post:", error);
    return NextResponse.json(new ApiError(500, "Error creating category post"), { status: 500 });
   }
}