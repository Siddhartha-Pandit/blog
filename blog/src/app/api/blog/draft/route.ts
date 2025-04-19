// blog/src/app/api/blog/draft/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import ContentModel from "@/models/Content";
import CategoryModel from "@/models/Category";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { uploadOnCloudinary } from "@/lib/cloudinary";
import fs from "fs";
import path from "path";
import UserModel from "@/models/User";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const form = await request.formData();
    const title = form.get("title")?.toString().trim();
    const content = form.get("content")?.toString();
    const category = form.get("category")?.toString();
    const tagsStr = form.get("tags")?.toString();
    const metaDescription = form.get("metaDescription")?.toString();
    const publishStr = form.get("publishDateTime")?.toString();
    const featureImageFile = form.get("featureImage") as File | null;

    // Validate required
    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    // Parse tags
    let parsedTags: string[] = [];
    try {
      parsedTags = tagsStr ? JSON.parse(tagsStr) : [];
    } catch {
      parsedTags = [];
    }

    await dbConnect();

    // Resolve category ID
    let categoryId = null;
    if (category) {
      const foundCat = await CategoryModel.findById(category);
      if (!foundCat) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 });
      }
      categoryId = foundCat._id;
    }

    // Find user from session
    const providerId = session.user.id;
    const userData = await UserModel.findOne({ providerId });
    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Handle feature image upload
    let featureImageUrl = "";
    if (featureImageFile && featureImageFile.size) {
      const buffer = Buffer.from(await featureImageFile.arrayBuffer());
      const tmpDir = path.join(process.cwd(), "public", "temp");
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
      const tmpName = `${Date.now()}-${featureImageFile.name}`;
      const tmpPath = path.join(tmpDir, tmpName);
      await fs.promises.writeFile(tmpPath, buffer);
      try {
        const result = await uploadOnCloudinary(tmpPath);
        if (result && result.secure_url) {
          featureImageUrl = result.secure_url;
        } else {
          return NextResponse.json({ error: "Image upload failed" }, { status: 500 });
        }
        
      } catch (err) {
        console.error("Cloudinary upload error:", err);
        return NextResponse.json({ error: "Image upload failed" }, { status: 500 });
      } finally {
        // clean up temp file
        fs.unlink(tmpPath, () => {});
      }
    }

    // Determine publishDateTime and isPublished
    let publishDate: Date | null = null;
    let isPublished = false;
    if (publishStr) {
      const d = new Date(publishStr);
      if (!isNaN(d.getTime())) {
        publishDate = d;
        isPublished = d <= new Date();
      }
    }

    // Create content document
    const doc = new ContentModel({
      title,
      content,
      author: userData._id,
      category: categoryId,
      tags: parsedTags,
      featureImage: featureImageUrl,
      metaDescription: metaDescription || "",
      shares: 0,
      likes: [],
      isPublished,
      publishDateTime: publishDate,
    });

    const saved = await doc.save();
    return NextResponse.json({ message: "Draft saved", data: saved }, { status: 201 });
  } catch (err) {
    console.error("Draft save error:", err);
    return NextResponse.json({ error: "Error saving draft" }, { status: 500 });
  }
}