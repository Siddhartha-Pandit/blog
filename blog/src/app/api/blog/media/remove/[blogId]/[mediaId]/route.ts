import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import dbConnect from "@/lib/dbConnect";
import { ApiResponse } from "@/lib/ApiResponse";
import { ApiError } from "@/lib/ApiError";
import ContentModel from "@/models/Content";
import MediaModel from "@/models/Media";
import { deleteFromCloudinary } from "@/lib/cloudinary";
export async function DELETE(
  req: Request,
  { params }: { params: { blogId: string; mediaId: string } }
) {
  console.debug("Received the GET request to update the media");
  const session = await getServerSession(authOptions);
  if (!session) {
    console.error("Unauthorized request: No token found.");
    return NextResponse.json(new ApiError(401, "User is unauthorized"), {
      status: 401,
    });
  }
  console.debug("Authenticated user:", session.user.id);

  if (!params.blogId || !params.mediaId) {
    console.error("Missing blogId or mediaId in URL parameters.");
    return NextResponse.json(
      new ApiError(400, "Blog id and media id are required"),
      { status: 400 }
    );
  }

  try {
    await dbConnect();
    console.debug("Database connection established.");
  } catch (error) {
    return NextResponse.json(
      new ApiError(500, "Database connection error"),
      { status: 500 }
    );
  }

  try {
    
    const blog = await ContentModel.findOne({
      _id: params.blogId,
      author: session.user.id,
    });
    if (!blog) {
      console.error("Blog not found or unauthorized user to update the blog.");
      return NextResponse.json(
        new ApiError(400, "No blogs found for you"),
        { status: 400 }
      );
    }

    const media = await MediaModel.findOne({
      _id: params.mediaId,
      contentId: params.blogId,
    });
    if (!media) {
      console.error("Media record not found.");
      return NextResponse.json(
        new ApiError(404, "Media record not found"),
        { status: 404 }
      );
    }

    try {
        await deleteFromCloudinary(media.link);
        const deleteMedia=media.deleteOne();
        console.debug("File deleted from cloudinary and in database.");
        return NextResponse.json(
            new ApiResponse(200, media, "File updated successfully"),
            {status:200}
          );
      } catch (delError) {
        console.error("Error deleting  file from Cloudinary:", delError);
        return NextResponse.json(new ApiError(500,"Couldn't delete the media"),{status:500})
      }

   
  } catch (err) {
    console.error("Error during file update:", err);
    return NextResponse.json(new ApiError(500, "File update error"), {
      status: 500,
    });
  }
}
