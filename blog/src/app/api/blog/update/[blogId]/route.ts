// File: blog/src/app/api/blog/content/[blogId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import ContentModel from "@/models/Content";
import CategoryModel from "@/models/Category";
import UserModel from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { ApiResponse } from "@/lib/ApiResponse";
import { ApiError } from "@/lib/ApiError";
// PATCH: Update an existing blog content (draft or published)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { blogId: string } }
) {
  // 1. Authenticate user
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      new ApiError(401, "Unauthorized"),
      { status: 401 }
    );
  }

  // 2. Authorize only specific user
  const allowedUserId = process.env.ALLOWED_USER;
  if (session.user.id !== allowedUserId) {
    return NextResponse.json(
      new ApiError(403, "Forbidden: You are not allowed to update content."),
      { status: 403 }
    );
  }

  try {
    // 3. Validate blogId
    const { blogId } = params;
    if (!mongoose.isValidObjectId(blogId)) {
      return NextResponse.json(
        new ApiError(400, "Invalid blog ID format"),
        { status: 400 }
      );
    }

    // 4. Parse request body
    const payload = await req.json();
    const {
      title,
      content,
      category,
      tags,
      featureImage,
      metaDescription,
      isPublished,
      publishDateTime,
    } = payload;

    // Mandatory fields
    if (!title || !content) {
      return NextResponse.json(
        new ApiError(400, "Title and content are required"),
        { status: 400 }
      );
    }

    await dbConnect();

    // 5. Verify user exists in DB
    const user = await UserModel.findOne({ providerId: session.user.id });
    if (!user) {
      return NextResponse.json(
        new ApiError(404, "User not found"),
        { status: 404 }
      );
    }

    // 6. Verify category if provided
    let categoryId = undefined;
    if (category) {
      if (!mongoose.isValidObjectId(category)) {
        return NextResponse.json(
          new ApiError(400, "Invalid category ID format"),
          { status: 400 }
        );
      }
      const foundCat = await CategoryModel.findById(category);
      if (!foundCat) {
        return NextResponse.json(
          new ApiError(404, "Category not found"),
          { status: 404 }
        );
      }
      categoryId = foundCat._id;
    }

    // 7. Find and update the content
    const updated = await ContentModel.findByIdAndUpdate(
      blogId,
      {
        title,
        content,
        author: user._id,
        category: categoryId,
        tags: Array.isArray(tags) ? tags : [],
        featureImage: featureImage || "",
        metaDescription: metaDescription || "",
        shares: 0, // reset or preserve as needed
        isPublished: Boolean(isPublished),
        publishDateTime: isPublished ? (publishDateTime ? new Date(publishDateTime) : new Date()) : null,
      },
      { new: true, runValidators: true }
    )
      .populate({ path: "author", select: "fullName image -_id" })
      .lean();

    if (!updated) {
      return NextResponse.json(
        new ApiError(404, "Content not found"),
        { status: 404 }
      );
    }

    return NextResponse.json(
      new ApiResponse(200, updated, "Content updated successfully"),
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Error updating content:", err);
    return NextResponse.json(
      new ApiError(500, "Error updating content"),
      { status: 500 }
    );
  }
}
