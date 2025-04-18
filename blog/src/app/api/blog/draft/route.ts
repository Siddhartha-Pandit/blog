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
    const title = form.get("title")?.toString();
    const content = form.get("content")?.toString();
    const category = form.get("category")?.toString();
    const tags = form.get("tags")?.toString();
    const metaDescription = form.get("metaDescription")?.toString();
    const featureImageFile = form.get("featureImage") as File | null;

   

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    let parsedTags: string[] = [];
    try {
      parsedTags = tags ? JSON.parse(tags) : [];
    } catch {
      parsedTags = [];
    }

    await dbConnect();

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

    

    // 6. Validate and prepare the author field
    const providerId = session.user.id;
    const userData= await UserModel.findOne({providerId})
    if (!userData) {
      return NextResponse.json(
        { error: "No user found for this session" },
        { status: 404 }
      );
    }
    const userId=userData._id;
    let featureImageUrl = "";
    if (featureImageFile && featureImageFile.size) {
      const buffer = Buffer.from(await featureImageFile.arrayBuffer());

      const tempFolderPath = path.join(process.cwd(), "public", "temp");
      if (!fs.existsSync(tempFolderPath)) {
        fs.mkdirSync(tempFolderPath, { recursive: true });
      }
      const tempFileName = `${Date.now()}-${featureImageFile.name}`;
      const tempFilePath = path.join(tempFolderPath, tempFileName);

      // Write the file buffer to disk
      await fs.promises.writeFile(tempFilePath, buffer);

      try {
        const uploadResult = await uploadOnCloudinary(tempFilePath);
        if (uploadResult && uploadResult.secure_url) {
          featureImageUrl = uploadResult.secure_url;
        }
      } catch (uploadError) {
        console.error("Error uploading feature image to Cloudinary:", uploadError);
        return NextResponse.json(
          { error: "Error uploading image" },
          { status: 500 }
        );
      }
    }
    const draft = new ContentModel({
      title,
      content,
      author: userId,
      category: categoryId,
      tags: Array.isArray(parsedTags) ? parsedTags : [],
      featureImage: featureImageUrl || "",
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
    return NextResponse.json({ error: "Error saving draft" }, { status: 500 });
  }
}
