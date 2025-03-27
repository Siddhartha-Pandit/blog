import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import ContentModel from "@/models/Content";
import { ApiResponse } from "@/lib/ApiResponse";
import { ApiError } from "@/lib/ApiError";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { getServerSession } from "next-auth";
export async function PUT(req: Request,
    { params }: { params: { blogId: string } }){
        console.debug("Received PUT request to update blog:", params.blogId);

        const session=await getServerSession(authOptions);
        if(!session){
            console.error("Unauthorized request: No token found.");
            return NextResponse.json(new ApiError(401, "user is unauthorized"),{status:401});
        }
        console.debug("Authenticated user:", session.user.id);
        try{
            const {title,contentBody,isPublished,category,publishDateTime}=await req.json();
            console.debug("Update payload received:", { title, contentBody, isPublished, category, publishDateTime });
            if(!params.blogId){
                console.error("Blog id missing in URL parameters.");
                return NextResponse.json(new ApiError(400,"Blog id is required for update"),{status:400});
            }
            await dbConnect();
            console.debug("Database connection established.");
            const blog=await ContentModel.findOne({_id:params.blogId,author:session.user.id});
            if(!blog){
                console.error("Blog not found or unauthorized update attempt for:", params.blogId);
                return NextResponse.json(new ApiError(404,"Blogs no found or you are not authorized to update the blog."))
            }
            if(title) blog.title=title;
            if(contentBody) blog.contentBody=contentBody;
            if(isPublished) blog.isPublished=isPublished;
            if(category) blog.category =category;
            if(publishDateTime) blog.publishDateTime=new Date(publishDateTime)
            
            console.debug("Updated blog fields:", blog);

            const updatedBlog=await blog.save();
            console.debug("Blog updated successfully:", updatedBlog);
            return NextResponse.json(new ApiResponse(200,updatedBlog,"Blog updated successfully."),{status:200});
        }

        catch(error){
            console.error("Error while updating the blog:", error);
            return NextResponse.json(new ApiError(500,"Error while updaing the blog"),{status:500});
        }
}