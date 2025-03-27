import CommentModel, { CommentDoc } from "@/models/Comment";
import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import { ApiResponse } from "@/lib/ApiResponse";
import { ApiError } from "@/lib/ApiError";

async function populateRepliesRecursively(
  comment: CommentDoc
): Promise<CommentDoc> {
  
  await comment.populate("reply");

  const replies = comment.reply as CommentDoc[];

  if (Array.isArray(replies) && replies.length > 0) {
    comment.reply = await Promise.all(
      replies.map((child) => populateRepliesRecursively(child))
    );
  }
  return comment;
}

export async function GET(
  request: Request,
  { params }: { params: { blogId: string } }
) {
  if (!params.blogId) {
    return NextResponse.json(
      new ApiError(400, "blogId is required"),
      { status: 400 }
    );
  }

  try {
    await dbConnect();
    const comments = await CommentModel.find({ contentId: params.blogId });
    const commentWithReplies = await Promise.all(
      comments.map((comment) => populateRepliesRecursively(comment))
    );
    return NextResponse.json(
      new ApiResponse(200, commentWithReplies, "Comments with replies retrieved."),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching comments with replies:", error);
    return NextResponse.json(
      new ApiError(500, "No comments found"),
      { status: 500 }
    );
  }
}
