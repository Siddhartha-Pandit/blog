import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import CategoryModel from "@/models/Category";
import { ApiResponse } from "@/lib/ApiResponse";
import { ApiError } from "@/lib/ApiError";

export async function GET(
  req: Request
) {
  console.debug("Received GET request to update a category.");
   
  try {
    await dbConnect();
    console.debug("Database connected.");
    const category = await CategoryModel.findById({});
    console.debug("Categories retrieved:", category);
    return NextResponse.json(
      new ApiResponse(200, category, "Category found successfully"),
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
