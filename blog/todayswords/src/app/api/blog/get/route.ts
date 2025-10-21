// src/app/api/blog/get/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { DocumentModel } from "@/models/document.model";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  await dbConnect();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Document ID is required" }, { status: 400 });
  }

  const document = await DocumentModel.findOne({
    _id: id,
    userId: session.user.id, // Ensure only the owner can fetch
  }).lean();

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  return NextResponse.json(document);
}
