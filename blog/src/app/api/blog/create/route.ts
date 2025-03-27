import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import ContentModel from "@/models/Content";
import { ApiResponse } from "@/lib/ApiResponse";
import { ApiError } from "@/lib/ApiError";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import CategoryModel from "@/models/Category";
export async function POST(request: Request) {
  console.debug("Received POST request to create a new blog post.");

  const session = await getServerSession(authOptions);
  console.log("sessions in routes.ts at blog->create",session)
  if (!session) {
    console.error("Unauthorized request: No session found.");
    return NextResponse.json(new ApiError(401, "User is unauthorized"), { status: 401 });
  }
  console.debug("Authenticated user:", session.user.id);

  try {
    const { title, contentBody, shares, likes, isPublished, category,tags, publishDateTime } = await request.json();
    console.debug("Received payload:", { title, contentBody, shares, likes, isPublished, category, publishDateTime });
    if (!title || !contentBody || !category) {
      console.error("Validation failed: Missing required fields.");
      return NextResponse.json(
        new ApiError(400, "Title, content, and category are required."),
        { status: 400 }
      );
    }
    
    await dbConnect();
    console.debug("Database connected.");
    const myCategory = await CategoryModel.findOne({ _id: category });
    if(!myCategory){
      return NextResponse.json(new ApiError(404,"content Not found"),{status:404})
    }
    const newContent = new ContentModel({
      title,
      contentBody,
      author: session.user.id,
      shares:0,
      likes: 0,
      isPublished,
      category:myCategory._id,
      tags: Array.isArray(tags) ? tags:[],
      publishDateTime: publishDateTime ? new Date(publishDateTime) : new Date()
    });
    console.debug("New blog content constructed:", newContent);
    const savedContent = await newContent.save();
    console.debug("Saved content:", savedContent);

    if (savedContent._id) {
      console.debug("Blog created successfully with id:", savedContent._id);
      return NextResponse.json(new ApiResponse(201, savedContent, "Blog created successfully"), { status: 201 });
    } else {
      console.error("Failed to save the blog post. No _id returned.");
      return NextResponse.json(new ApiError(500, "Couldn't save the blog."), { status: 500 });
    }
  } catch (error) {
    console.error("Error creating blog post:", error);
    return NextResponse.json(new ApiError(500, "Error creating blog post"), { status: 500 });
  }
}
