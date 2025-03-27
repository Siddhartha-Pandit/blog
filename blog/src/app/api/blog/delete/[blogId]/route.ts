import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import ContentModel from "@/models/Content";
import { ApiResponse } from "@/lib/ApiResponse";
import { ApiError } from "@/lib/ApiError";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { getServerSession } from "next-auth";
export async function DELETE(req:Request,
    {params}:{params:{blogId:string}}){
    console.debug("Received DELETE request to delete blog:", params.blogId);
    const session=await getServerSession(authOptions);
    if(!session){
        console.error("Unauthorized request: No token found.");
        return NextResponse.json(new ApiError(401, "User is unauthorized"),{status:401});
    }
    console.debug("Authenticated user:", session.user.id);
    try{
        if(!params.blogId){
            console.error("Blog id missing in URL parameters.");
            return NextResponse.json(new ApiError(400,"Blog id is required for delete"),{status:400});
        }
        await dbConnect();
        console.debug("Database connection established in blog/delete.");
        const blog=await ContentModel.findOne({_id:params.blogId,author:session.user.id});
        if(!blog){
            console.error("Blog not found or unauthorized delete attempt for:", params.blogId);
            return NextResponse.json(new ApiError(404,"Blog not found or you are not authorized to delete the blog."),{status:404});
        }
        const deletedBlog=await blog.deleteOne();
        console.debug("Blog deleted successfully:", deletedBlog);
        return NextResponse.json(new ApiResponse(200,deletedBlog,"Blog deleted successfully."),{status:200});
    }
    catch(error){
        console.error("Error while deleting the blog:", error);
        return NextResponse.json(new ApiError(500,"Error while deleting the blog"),{status:500});
    }
}