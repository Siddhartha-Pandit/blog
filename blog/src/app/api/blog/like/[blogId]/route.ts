import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import ContentModel from "@/models/Content";
import { ApiResponse } from "@/lib/ApiResponse";
import { ApiError } from "@/lib/ApiError";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { getServerSession } from "next-auth";
import mongoose,{Schema,Document} from "mongoose";
export async function PUT(req: Request, { params }: { params: { blogId: string } }) {
    console.debug("Received PUT request to update like blog:", params.blogId);

    const session = await getServerSession(authOptions);
    if (!session) {
        console.error("Unauthorized request: No token found.");
        return NextResponse.json(new ApiError(401, "User is unauthorized"), { status: 401 });
    }
    console.debug("Authenticated user:", session.user.id);

    try {
        if (!params.blogId) {
            console.error("Blog id missing in URL parameters.");
            return NextResponse.json(new ApiError(400, "Blog id is required for update"), { status: 400 });
        }

        await dbConnect();
        console.debug("Database connection established.");

        const blog = await ContentModel.findById(params.blogId);
        if (!blog) {
            console.error("Blog not found or unauthorized update attempt for:", params.blogId);
            return NextResponse.json(new ApiError(404, "Blog not found or you are not authorized to update the blog."), { status: 404 });
        }

        const userId = session.user.id;
        
        const likeIndex = blog.likes.findIndex((like) => like.toString() === userId);

        if (likeIndex !== -1) {
            blog.likes.splice(likeIndex, 1); // Remove like
            console.debug(`Removed user ${userId} from likes.`);
        } else {
            blog.likes.push(userId as unknown as Schema.Types.ObjectId);
            console.debug(`Added user ${userId} to likes.`);
        }

        await blog.save();

        return NextResponse.json(new ApiResponse(200, null, "Like status updated successfully."), { status: 200 });

    } catch (error) {
        console.error("Error updating like status in blog post:", error);
        return NextResponse.json(new ApiError(500, "Error updating like status in blog post"), { status: 500 });
    }
}
