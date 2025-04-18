// app/api/blog/read/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import ContentModel from "@/models/Content";
import { ApiResponse } from "@/lib/ApiResponse";
import { ApiError } from "@/lib/ApiError";

export async function GET(req: Request) {
  try {
    // 1. Establish database connection
    await dbConnect();
    console.debug("Database connection established.");

    // 2. Parse pagination params from query string
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "10", 10));
    const skip = (page - 1) * limit;

    // 3. Get total document count for pagination metadata
    const total = await ContentModel.countDocuments();

    // 4. Query one page of blogs, newest first,
    //    and populate only author.userName + author.image
    const blogs = await ContentModel.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "author",
        select: "fullName image -_id"
      })
      .lean();

    // 5. Compute total pages
    const totalPages = Math.ceil(total / limit);

    // 6. Return structured JSON response
    return NextResponse.json(
      new ApiResponse(
        200,
        { items: blogs, page, totalPages, total },
        "Blogs retrieved successfully"
      ),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error while reading blogs:", error);
    return NextResponse.json(
      new ApiError(500, "Error while reading blogs"),
      { status: 500 }
    );
  }
}
