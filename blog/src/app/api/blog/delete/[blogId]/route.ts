import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import dbConnect from "@/lib/dbConnect";
import ContentModel from "@/models/Content";
import { ApiResponse } from "@/lib/ApiResponse";
import { ApiError } from "@/lib/ApiError";

export async function DELETE(
  req: Request,
  { params }: { params: { blogId: string } }
) {
  if (!params.blogId) {
    return NextResponse.json(
      new ApiError(400, "BlogId is required"),
      { status: 400 }
    );
  }
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      new ApiError(401, "Unauthorized access"),
      { status: 401 }
    );
  }

  try {

    await dbConnect();

    const blogToDelete = await ContentModel.findOne({_id:params.blogId,author:session.user.id});
    
    if (!blogToDelete) {
      return NextResponse.json(
        new ApiError(404, "Blog not found"),
        { status: 404 }
      );
    }

    await ContentModel.deleteOne({ _id: params.blogId, author: session.user.id });


    return NextResponse.json(
      new ApiResponse(200, "Blog deleted successfully"),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting blog:", error);
    return NextResponse.json(
      new ApiError(500, "Internal Server Error"),
      { status: 500 }
    );
  }
}