import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import ContentModel from "@/models/Content";
import UserModel from "@/models/User";
import { ApiResponse } from "@/lib/ApiResponse";
import { ApiError } from "@/lib/ApiError";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import mongoose from "mongoose"; 

export async function PUT(
  req: Request,
  { params }: { params: { blogId: string } }
) {
  console.debug("Received PUT request to update bookmark for blog:", params.blogId);

  // Get the current session
  const session = await getServerSession(authOptions);
  if (!session) {
    console.error("Unauthorized request: No token found.");
    return NextResponse.json(
      new ApiError(401, "User is unauthorized"),
      { status: 401 }
    );
  }
  console.debug("Authenticated user:", session.user.id);

  try {
    if (!params.blogId) {
      console.error("Blog id missing in URL parameters.");
      return NextResponse.json(
        new ApiError(400, "Blog id is required for update"),
        { status: 400 }
      );
    }

    await dbConnect();
    console.debug("Database connection established.");

    // Check if the blog exists (optional, but recommended)
    const blog = await ContentModel.findById(params.blogId);
    if (!blog) {
      console.error("Blog not found:", params.blogId);
      return NextResponse.json(
        new ApiError(404, "Blog not found"),
        { status: 404 }
      );
    }

    // Fetch the current user document from the database
    const user = await UserModel.findById(session.user.id);
    if (!user) {
      console.error("User not found:", session.user.id);
      return NextResponse.json(
        new ApiError(404, "User not found"),
        { status: 404 }
      );
    }

    // Check if the blog is already bookmarked
    const bookmarkIndex = user.bookmarks.findIndex(
      (bookmark) => bookmark.toString() === params.blogId
    );
    let bookmarkStatus = false;

    if (bookmarkIndex !== -1) {
      // Remove the bookmark if it exists
      user.bookmarks.splice(bookmarkIndex, 1);
      bookmarkStatus = false;
      console.debug(`Removed blog ${params.blogId} from bookmarks.`);
    } else {
      // Otherwise, add the bookmark
      user.bookmarks.push(new mongoose.Types.ObjectId(params.blogId));
      bookmarkStatus = true;
      console.debug(`Added blog ${params.blogId} to bookmarks.`);
    }

    // Save the updated user document
    await user.save();

    return NextResponse.json(
      new ApiResponse(
        200,
        { bookmarkStatus, bookmarkCount: user.bookmarks.length },
        "Bookmark status updated successfully."
      ),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating bookmark status for blog:", error);
    return NextResponse.json(
      new ApiError(500, "Error updating bookmark status for blog"),
      { status: 500 }
    );
  }
}
