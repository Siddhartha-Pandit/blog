import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { DocumentModel, IDocument } from "@/models/document.model.ts";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import mongoose from "mongoose";

const recursiveRestore = async (documentId: mongoose.Types.ObjectId) => {
  const children = await DocumentModel.find({ parentDocument: documentId });

  for (const child of children) {
    child.isArchived = false;
    await child.save();

    // Cast _id to ObjectId
    await recursiveRestore(child._id as mongoose.Types.ObjectId);
  }
};

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (session.user.role !== "author")
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const { id } = await req.json();
  await dbConnect();

  const document = await DocumentModel.findById(id) as IDocument | null;
  if (!document)
    return NextResponse.json({ error: "Document not found" }, { status: 404 });

  if ((document.userId as mongoose.Types.ObjectId).toString() !== session.user.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  document.isArchived = false;
  await document.save();

  // Restore all children recursively
  await recursiveRestore(document._id as mongoose.Types.ObjectId);

  return NextResponse.json({ success: true, document });
}
