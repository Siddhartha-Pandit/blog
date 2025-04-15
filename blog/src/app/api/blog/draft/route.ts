import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import ContentModel from "@/models/Content";
import CategoryModel from "@/models/Category";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

export async function POST(request: Request) {
  // 1) Auth check via cookie
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 2) Destructure exactly what the client sends
    const { title, content, category, tags, featureImage, metaDescription } =
      await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // 3) Allow drafts *without* a category if you like
    let categoryId = null;
    if (category) {
      const found = await CategoryModel.findById(category);
      if (!found) {
        return NextResponse.json(
          { error: "Category not found" },
          { status: 404 }
        );
      }
      categoryId = found._id;
    }

    // 4) Create the draft
    const draft = new ContentModel({
      title,
      content,
      author: session.user.id,
      category: categoryId,
      tags: Array.isArray(tags) ? tags : [],
      featureImage: featureImage || "",
      metaDescription: metaDescription || "",
      shares: 0,
      likes: [],
      isPublished: false,
      publishDateTime: null,
    });

    const saved = await draft.save();
    return NextResponse.json(
      { message: "Draft saved", data: saved },
      { status: 201 }
    );
  } catch (err) {
    console.error("❌ Draft save error:", err);
    return NextResponse.json(
      { error: "Error saving draft" },
      { status: 500 }
    );
  }
}
