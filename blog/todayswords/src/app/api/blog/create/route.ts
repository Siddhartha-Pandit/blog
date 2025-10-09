import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { DocumentModel } from "@/models/document.model.ts";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (session.user.role !== "author")
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { title, content, parentDocument } = await req.json();
  await dbConnect();

  const document = await DocumentModel.create({
    title,
    content,
    parentDocument: parentDocument || null,
    userId: session.user.id,
    isArchived: false,
    isPublished: false,
  });

  return NextResponse.json(document);
}
