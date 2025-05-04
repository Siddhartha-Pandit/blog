// File: pages/api/blogs/[id]/delete.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../auth/[...nextauth]/authOptions";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import ContentModel from "@/models/Content";
import { deleteFromCloudinary } from "@/lib/cloudinary";

export async function DELETE(
  req: Request,
  { params }: { params: { blogId: string } }
) {
  try {
    // 1) Authenticate & get session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2) Connect DB and fetch our User document by providerId
    await dbConnect();

    const user = await UserModel.findOne({ providerId: session.user.id });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const userId = user._id;

    // 3) Fetch the blog post and check ownership
    const blog = await ContentModel.findById(params.blogId);
    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    if (!blog.author.equals(userId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 4) Delete the feature image from Cloudinary
    await deleteFromCloudinary(blog.featureImage);

   
    // 5) Delete the blog document
    const deleteResult = await ContentModel.deleteOne({ _id: params.blogId });

    // 6) Return success
    return NextResponse.json({ message: "Blog deleted" }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
