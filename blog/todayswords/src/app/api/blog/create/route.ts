import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { DocumentModel } from "@/models/document.model";

interface CreateDocumentPayload {
  title: string;
  content?: string;
  parentDocument?: string;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;
    await dbConnect();

    const body: CreateDocumentPayload = await req.json();
    if (!body.title) return new NextResponse("Title is required", { status: 400 });

    const newDoc = await DocumentModel.create({
      title: body.title,
      content: "",
      parentDocument: body.parentDocument || null,
      userId,
      isArchived: false,
      isPublished: false,
    });

    return NextResponse.json(newDoc, { status: 201 });
  } catch (error: any) {
    console.error("[DOCUMENTS_POST] Error creating document:", error);
    return new NextResponse(error?.message || "Internal Error", { status: 500 });
  }
}
