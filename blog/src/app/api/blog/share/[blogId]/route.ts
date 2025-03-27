import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import ContentModel from "@/models/Content";
import { ApiResponse } from "@/lib/ApiResponse";
import { ApiError } from "@/lib/ApiError";

export async function PUT(req: Request, { params }: { params: { blogId: string } }) {
    console.debug("Received PUT request to update share blog:", params.blogId);

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

        blog.shares += 1;
        await blog.save();

        return NextResponse.json(new ApiResponse(200, null, "Shared successfully."), { status: 200 });

    } catch (error) {
        console.error("Error updating shares in blog post:", error);
        return NextResponse.json(new ApiError(500, "Error updating shares in blog post"), { status: 500 });
    }
}
