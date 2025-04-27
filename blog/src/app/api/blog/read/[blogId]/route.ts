import { ApiResponse } from "@/lib/ApiResponse";
import { ApiError } from "@/lib/ApiError";
import ContentModel from "@/models/Content";
import dbConnect from "@/lib/dbConnect";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(
  req: NextRequest,
  { params }: { params: { blogId: string } }
) {
  console.debug("Received GET request to read blog:", params.blogId);

  try {
    const { blogId } = params;

    if (!blogId) {
      console.error("Blog id missing in URL parameters.");
      return NextResponse.json(
        new ApiError(400, "Blog id is required for read"),
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      console.error("Invalid blog ID format:", blogId);
      return NextResponse.json(
        new ApiError(400, "Invalid blog ID format"),
        { status: 400 }
      );
    }

    await dbConnect();
    console.debug("Database connection established.");

    const blog = await ContentModel.findById(blogId)
      .populate({
        path: "author",
        select: "fullName image -_id",
      })
      .lean();

    if (!blog) {
      console.error("Blog not found:", blogId);
      return NextResponse.json(
        new ApiError(404, "Blog not found"),
        { status: 404 }
      );
    }

    return NextResponse.json(
      new ApiResponse(200, blog, "Blog read successfully"),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error while reading the blog:", error);
    return NextResponse.json(
      new ApiError(500, "Error while reading the blog"),
      { status: 500 }
    );
  }
}