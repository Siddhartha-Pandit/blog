import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import CommentModel from "@/models/Comment";
import { ApiResponse } from "@/lib/ApiResponse";
import { ApiError } from "@/lib/ApiError";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

export async function DELETE(
  request: Request,
  { params }: { params: { blogId: string, commentId: string} }
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
    if(!params.blogId || !params.commentId){
        console.error("Blog id or comment id missing in URL parameters.");
        return NextResponse.json(new ApiError(400,"Blog id  and comment id is required for update"),{status:400});
    }

    await dbConnect();
    console.debug("Database connected.");

    const comment = await CommentModel.findOne({_id:params.commentId,contentId:params.blogId,userId:session.user.id});
    if (!comment) {
      console.debug("comment  not found");
      return NextResponse.json(
        new ApiError(404, "Comment not found."),
        { status: 404 }
      );
    }
    
    await CommentModel.deleteOne({_id:params.commentId,contentId:params.blogId,userId:session.user.id});
    return NextResponse.json(new ApiResponse(200, null,"Comment deleted successfully."))
  } catch (error) {
    console.error("Error while deleting comment:", error);
    return NextResponse.json(
      new ApiError(500, "Error while deleting comment"),
      { status: 500 }
    );
  }
}
