import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { DocumentModel } from "@/models/document.model.ts";

interface Params {
  id: string;
}

export async function GET(req: Request, { params }: { params: Params }) {
  await dbConnect();
  const document = await DocumentModel.findById(params.id);
  if (!document || document.isArchived) return NextResponse.json(null);

  // Only return unpublished if the requester is the author
  return NextResponse.json(document);
}
