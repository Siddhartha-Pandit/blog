import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { DocumentModel, IDocument } from "@/models/document.model";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

// --- Define the tree interface ---
interface DocumentTree extends Omit<IDocument, keyof mongoose.Document> {
  _id: string;
  children: DocumentTree[];
}

// --- Recursive tree builder ---
async function buildDocumentTree(
  userId: string,
  parentId: string | null
): Promise<DocumentTree[]> {
  const documents = await DocumentModel.find({
    userId,
    parentDocument: parentId,
    isArchived: false,
  })
    .sort({ createdAt: -1 })
    .lean(); // ensures plain JS objects, not mongoose Documents

  const results: DocumentTree[] = [];

  for (const doc of documents) {
    const children = await buildDocumentTree(userId, doc._id.toString());
    results.push({
      ...doc,
      _id: doc._id.toString(), // convert ObjectId to string
      children,
    });
  }

  return results;
}

// --- API Route ---
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const parentDocument = searchParams.get("parentDocument") || null;

    const documentTree = await buildDocumentTree(session.user.id, parentDocument);

    return NextResponse.json(documentTree, { status: 200 });
  } catch (error) {
    console.error("GET /api/documents error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
