// File: blog/src/app/api/blog/mystory/update/[blogId]/route.ts

import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import ContentModel from "@/models/Content";
import CategoryModel from "@/models/Category";
import UserModel from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { uploadOnCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";
import fs from "fs";
import path from "path";

export async function PUT(request: Request, context: { params: { blogId: string } }) {
  const { blogId } = context.params;

  // 1) Authenticate
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2) Parse form data
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  // 3) Extract fields
  const title = form.get("title")?.toString().trim();
  const contentRaw = form.get("content")?.toString() || "";  // <- keep as string
  const tagsRaw = form.get("tags")?.toString();
  const metaDescription = form.get("metaDescription")?.toString();
  const categoryIdRaw = form.get("category")?.toString();
  const featureImageFile = form.get("featureImage") as File | null;

  if (!title || !contentRaw) {
    return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
  }

  // 4) Parse tags array
  let tags: string[] = [];
  try {
    tags = tagsRaw ? JSON.parse(tagsRaw) : [];
  } catch {
    // leave empty on parse failure
  }

  // 5) Connect to DB
  await dbConnect();

  // 6) Load user & blog
  const user = await UserModel.findOne({ providerId: session.user.id });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const blog = await ContentModel.findById(blogId);
  if (!blog) {
    return NextResponse.json({ error: "Blog not found" }, { status: 404 });
  }
  if (!blog.author.equals(user._id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // 7) Update textual fields - store content as raw string
  blog.title = title;
  blog.content = contentRaw;                // <-- assign string directly
  blog.metaDescription = metaDescription ?? blog.metaDescription;
  blog.tags = tags;

  if (categoryIdRaw) {
    const cat = await CategoryModel.findById(categoryIdRaw);
    if (!cat) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }
    blog.category = cat._id;
  }

  // 8) Handle feature image
  if (featureImageFile && featureImageFile.size > 0) {
    // 8a) Delete old image
    if (blog.featureImage) {
      try {
        await deleteFromCloudinary(blog.featureImage);
      } catch {
        // proceed even if deletion fails
      }
    }

    // 8b) Write the uploaded file to a temp path
    const tmpDir = path.join(process.cwd(), "public", "temp");
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
    const tmpName = `${Date.now()}-${featureImageFile.name}`;
    const tmpPath = path.join(tmpDir, tmpName);
    const buffer = Buffer.from(await featureImageFile.arrayBuffer());
    await fs.promises.writeFile(tmpPath, buffer);

    // 8c) Upload new image
    let uploadRes;
    try {
      uploadRes = await uploadOnCloudinary(tmpPath);
    } catch {
      // Clean up and return error
      fs.existsSync(tmpPath) && fs.unlinkSync(tmpPath);
      return NextResponse.json({ error: "Image upload failed" }, { status: 500 });
    }
    // Remove temp file
    fs.existsSync(tmpPath) && fs.unlinkSync(tmpPath);

    if (uploadRes?.secure_url) {
      blog.featureImage = uploadRes.secure_url;
    }
  }

  // 9) Save and respond
  try {
    const updated = await blog.save();
    return NextResponse.json({ message: "Blog updated", data: updated }, { status: 200 });
  } catch (err) {
    console.error("Blog update error:", err);
    return NextResponse.json({ error: "Failed to update blog" }, { status: 500 });
  }
}
