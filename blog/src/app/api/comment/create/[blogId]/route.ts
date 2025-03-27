import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import CommentModel from "@/models/Comment";
import ContentModel from "@/models/Content";
import { ApiResponse } from "@/lib/ApiResponse";
import { ApiError } from "@/lib/ApiError";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

export async function POST(
  request: Request,
  { params }: { params: { blogId: string } }
) {
  console.debug("Received POST request to add a new comment.");

  const session = await getServerSession(authOptions);
  console.log("Session in routes.ts at comment->create:", session);
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

    const content = await ContentModel.findById(params.blogId);
    if (!content) {
      console.debug("Content (blog) not found");
      return NextResponse.json(
        new ApiError(404, "Blog not found."),
        { status: 404 }
      );
    }

    const newComment = new CommentModel({
      comment,
      likes: [],
      commentDate: Date.now(),
      contentId: params.blogId,
      userId: session.user.id,
      reply: [],
    });

    const savedComment = await newComment.save();

    if (savedComment._id) {
      console.debug("Comment created successfully:", savedComment);
      return NextResponse.json(
        new ApiResponse(200, savedComment, "Comment created successfully."),
        { status: 200 }
      );
    } else {
      console.error("Failed to save the comment. No _id returned.");
      return NextResponse.json(
        new ApiError(500, "Failed to create comment."),
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error while adding comment:", error);
    return NextResponse.json(
      new ApiError(500, "Error while creating comment"),
      { status: 500 }
    );
  }
}
