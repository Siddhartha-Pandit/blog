import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import CommentModel from "@/models/Comment";
import { ApiResponse } from "@/lib/ApiResponse";
import { ApiError } from "@/lib/ApiError";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

export async function PUT(
  request: Request,
  { params }: { params: { blogId: string; commentId: string } }
) {
  console.debug("Received PUT request to update a comment.");

  const session = await getServerSession(authOptions);
  console.log("Session in routes.ts at comment->update:", session);

  if (!session) {
    console.error("Unauthorized request: No session found.");
    return NextResponse.json(new ApiError(401, "User is unauthorized"), {
      status: 401,
    });
  }
  console.debug("Authenticated user:", session.user.id);

  try {
    const { comment } = await request.json();
    if (!comment) {
      console.error("Validation failed: Comment is required.");
      return NextResponse.json(
        new ApiError(400, "Comment is required."),
        { status: 400 }
      );
    }

    await dbConnect();
    console.debug("Database connected.");

    // Find the comment by ID, blog ID, and user ID
    const oldComment = await CommentModel.findOne({
      _id: params.commentId,
      contentId: params.blogId,
      userId: session.user.id,
    });
    if (!oldComment) {
      console.debug("Comment not found or user is not the owner.");
      return NextResponse.json(
        new ApiError(404, "Comment not found."),
        { status: 404 }
      );
    }

    // Update the comment text
    oldComment.comment = comment;
    const updatedComment = await oldComment.save();

    if (updatedComment.comment === comment) {
      console.debug("Comment updated successfully.");
      return NextResponse.json(
        new ApiResponse(200, updatedComment, "Comment updated successfully."),
        { status: 200 }
      );
    }

    console.error("Comment could not be updated.");
    return NextResponse.json(
      new ApiError(500, "Comment could not be saved."),
      { status: 500 }
    );
  } catch (error) {
    console.error("Error while updating comment:", error);
    return NextResponse.json(
      new ApiError(500, "Error updating comment."),
      { status: 500 }
    );
  }
}
