import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { DocumentModel } from "@/models/document.model.ts";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") || "";
  await dbConnect();

  const documents = await DocumentModel.find({
    title: { $regex: q, $options: "i" },
    isArchived: false,
    isPublished: true,
  }).sort({ createdAt: -1 });

  return NextResponse.json(documents);
}
