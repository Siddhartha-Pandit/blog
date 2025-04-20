import { ApiResponse } from "@/lib/ApiResponse";
import { ApiError } from "@/lib/ApiError";
import ContentModel from "@/models/Content";
import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(
  req: Request,
  { params }: { params: { blogId: string } }
) {
  console.debug("Received GET request to read blog:", params.blogId);
  try {
    // 1) Validate blogId presence & format
    if (!params.blogId) {
      console.error("Blog id missing in URL parameters.");
      return NextResponse.json(
        new ApiError(400, "Blog id is required for read"),
        { status: 400 }
      );
    }
    if (!mongoose.Types.ObjectId.isValid(params.blogId)) {
      console.error("Invalid blog ID format:", params.blogId);
      return NextResponse.json(
        new ApiError(400, "Invalid blog ID format"),
        { status: 400 }
      );
    }

    // 2) Connect
    await dbConnect();
    console.debug("Database connection established.");

    // 3) Query & populate author.fullName and author.image
    const blog = await ContentModel.findById(params.blogId)
      .populate({
        path: "author",              // name of the field in Content schema
        select: "fullName image -_id" // pick only fullName & image, omit author’s _id if you like
      })
      .lean();                       // optional, returns a plain JS object

    if (!blog) {
      console.error("Blog not found:", params.blogId);
      return NextResponse.json(
        new ApiError(404, "Blog not found"),
        { status: 404 }
      );
    }

    // 4) Send back
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
