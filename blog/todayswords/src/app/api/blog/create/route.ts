import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { DocumentModel } from "@/models/document.model";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  // Get session
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  if (session.user.role !== "author")
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  // Get title/content/parentDocument/tenantId from request
  const { title, content, parentDocument, tenantId } = await req.json();

  if (!tenantId) {
    return NextResponse.json({ error: "Tenant ID is required" }, { status: 400 });
  }

  // Validate tenantId format
  if (!mongoose.Types.ObjectId.isValid(tenantId)) {
    return NextResponse.json({ error: "Invalid Tenant ID format" }, { status: 400 });
  }

  // Connect to DB
  await dbConnect();

  // Create new document
  const newDocument = await DocumentModel.create({
    title: title || "Untitled",
    content: content || "",
    parentDocument: parentDocument ? new mongoose.Types.ObjectId(parentDocument) : null,
    tenantId: new mongoose.Types.ObjectId(tenantId), // Fix here: instantiate ObjectId with `new`
    userId: session.user.id,
    isArchived: false,
    isPublished: false,
  });

  // Fix TypeScript by asserting _id type
  const docObj = {
    ...newDocument.toObject(),
    _id: (newDocument._id as mongoose.Types.ObjectId).toString(),
  };

  return NextResponse.json(docObj);
}
