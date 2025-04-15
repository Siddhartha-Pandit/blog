// app/api/blog/create/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import ContentModel from "@/models/Content";
import CategoryModel from "@/models/Category";
import { getServerSession } from "next-auth/next";
// Adjust the path to your authOptions configuration file as needed.
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

export async function POST(request: Request) {
  // Authenticate the user using NextAuth
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "User is unauthorized" }, { status: 401 });
  }

  try {
    const { title, contentBody, isPublished, category, tags, publishDateTime } = await request.json();

    // Validate required fields
    if (!title || !contentBody || !category) {
      return NextResponse.json(
        { error: "Title, content, and category are required." },
        { status: 400 }
      );
    }

    // Connect to the database
    await dbConnect();

    // Validate that the specified category exists
    const myCategory = await CategoryModel.findById(category);
    if (!myCategory) {
      return NextResponse.json({ error: "Category not found." }, { status: 404 });
    }

    // Create new blog content document
    const newContent = new ContentModel({
      title,
      contentBody,
      author: session.user.id,
      shares: 0,
      likes: [],
      isPublished,
      category: myCategory._id,
      tags: Array.isArray(tags) ? tags : [],
      publishDateTime: publishDateTime ? new Date(publishDateTime) : new Date(),
    });

    // Save the document and return the result
    const savedContent = await newContent.save();
    return NextResponse.json(
      { message: "Blog created successfully", data: savedContent },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating blog post:", error);
    return NextResponse.json({ error: "Error creating blog post" }, { status: 500 });
  }
}
