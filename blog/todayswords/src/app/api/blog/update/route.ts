// src/app/api/blog/update/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { DocumentModel } from "@/models/document.model.ts";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PATCH(req: NextRequest) {
  // Authenticate user
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  // Only authors can update documents
  if (session.user.role !== "author") {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 403 }
    );
  }

  const {
    id,
    title,
    content,
    coverImage,
    icon,
    isPublished,
    isArchived,
  } = await req.json();

  if (!id) {
    return NextResponse.json(
      { error: "Document id is required" },
      { status: 400 }
    );
  }

  await dbConnect();

  // Find document
  const document = await DocumentModel.findById(id);
  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  // Ensure the user owns this document
  if (document.userId.toString() !== session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Update fields if provided
  if (title !== undefined) document.title = title;
  if (content !== undefined) document.content = content;
  if (coverImage !== undefined) document.coverImage = coverImage; // ✅ Cloudinary URL goes here
  if (icon !== undefined) document.icon = icon;
  if (isPublished !== undefined) document.isPublished = isPublished;
  if (isArchived !== undefined) document.isArchived = isArchived;

  await document.save();

  return NextResponse.json(document);
}
