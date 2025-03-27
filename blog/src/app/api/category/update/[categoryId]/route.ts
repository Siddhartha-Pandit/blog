import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import CategoryModel from "@/models/Category";
import { ApiResponse } from "@/lib/ApiResponse";
import { ApiError } from "@/lib/ApiError";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/authOptions";

export async function PUT(
  req: Request,
  { params }: { params: { categoryId: string } }
) {
  console.debug("Received PUT request to update a category.");
  const session = await getServerSession(authOptions);
  console.log("Session in routes.ts at category->update:", session);
  
  if (!session) {
    console.error("Unauthorized request: No session found.");
    return NextResponse.json(
      new ApiError(401, "User is unauthorized"),
      { status: 401 }
    );
  }
  
  console.debug("Authenticated user:", session.user.id);
  
  const allowedUserId = process.env.ALLOWED_USER;
  if (session.user.id !== allowedUserId) {
    console.error("Forbidden request: User is not allowed.");
    return NextResponse.json(
      new ApiError(403, "Forbidden: You are not allowed to update a category."),
      { status: 403 }
    );
  }
  
  try {
    const { name } = await req.json();
    if (!name) {
      console.error("Validation failed: Name is required.");
      return NextResponse.json(
        new ApiError(400, "Name is required"),
        { status: 400 }
      );
    }
    
    await dbConnect();
    console.debug("Database connected.");
    
    const category = await CategoryModel.findById(params.categoryId);
    if (!category) {
      console.error("Category not found.");
      return NextResponse.json(
        new ApiError(404, "Category not found"),
        { status: 404 }
      );
    }
    
    category.name = name;
    await category.save();
    console.debug("Category updated successfully:", category);
    
    return NextResponse.json(
      new ApiResponse(200, category, "Category updated successfully"),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      new ApiError(500, "Error updating category"),
      { status: 500 }
    );
  }
}
