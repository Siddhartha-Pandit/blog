import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { uploadOnCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";
import fs from "fs/promises";
import path from "path";
import dbConnect from "@/lib/dbConnect";
import { ApiResponse } from "@/lib/ApiResponse";
import { ApiError } from "@/lib/ApiError";
import ContentModel from "@/models/Content";
import MediaModel from "@/models/Media";

export async function PUT(
  req: Request,
  { params }: { params: { blogId: string; mediaId: string } }
) {
  console.debug("Received the PUT request to update the media");
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
    const formData = await req.formData();
    const fileField = formData.get("file");
    if (!fileField || !(fileField instanceof File)) {
      console.error("No file provided in the request.");
      return NextResponse.json(new ApiError(400, "No file provided."), {
        status: 400,
      });
    }
    const buffer = Buffer.from(await fileField.arrayBuffer());
    const tempDir = path.join(process.cwd(), "blog", "public", "temp");
    try {
      await fs.access(tempDir);
    } catch {
      await fs.mkdir(tempDir, { recursive: true });
    }
    const filename = `${Date.now()}-${fileField.name}`;
    const localFilePath = path.join(tempDir, filename);
    await fs.writeFile(localFilePath, buffer);
    const cloudinaryResponse = await uploadOnCloudinary(localFilePath);
    console.debug("File uploaded to Cloudinary:", cloudinaryResponse);

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

    const oldLink = media.link;
    const oldName = media.name;

    media.name = fileField.name;
    media.link = cloudinaryResponse?.secure_url || "";
    const updatedMedia = await media.save();

    if (updatedMedia.link === cloudinaryResponse?.secure_url) {
      if (oldLink && oldLink !== updatedMedia.link) {
        try {
          await deleteFromCloudinary(oldLink);
          console.debug("Old file deleted from Cloudinary.");
        } catch (delError) {
          console.error("Error deleting old file from Cloudinary:", delError);
        }
      }
    } else {
      media.name = oldName;
      media.link = oldLink;
      await media.save();
    }

    return NextResponse.json(
      new ApiResponse(200, cloudinaryResponse, "File updated successfully")
    );
  } catch (err) {
    console.error("Error during file update:", err);
    return NextResponse.json(new ApiError(500, "File update error"), {
      status: 500,
    });
  }
}
