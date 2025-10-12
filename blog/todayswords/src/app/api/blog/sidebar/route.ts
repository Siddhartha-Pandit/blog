import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { DocumentModel } from "@/models/document.model.ts";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const parentDocument = searchParams.get("parentDocument");
    const userId = searchParams.get("userId");

    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const query: any = { userId, isArchived: false };
    if (parentDocument) query.parentDocument = parentDocument;

    const documents = await DocumentModel.find(query).sort({ createdAt: -1 });

    return NextResponse.json(documents);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
