import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { DocumentModel } from "@/models/document.model.ts";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (session.user.role !== "author")
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id, title, content, coverImage, icon, isPublished, isArchived } = await req.json();
  await dbConnect();

  const document = await DocumentModel.findById(id);
  if (!document) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (document.userId.toString() !== session.user.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  if (title !== undefined) document.title = title;
  if (content !== undefined) document.content = content;
  if (coverImage !== undefined) document.coverImage = coverImage;
  if (icon !== undefined) document.icon = icon;
  if (isPublished !== undefined) document.isPublished = isPublished;
  if (isArchived !== undefined) document.isArchived = isArchived;

  await document.save();
  return NextResponse.json(document);
}
