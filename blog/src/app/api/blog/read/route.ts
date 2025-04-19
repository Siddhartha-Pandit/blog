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

    // 3. Build filter for published blogs whose publishDateTime is in the past
    const now = new Date();
    const filter = {
      isPublished: true,
      publishDateTime: { $lte: now }
    };

    // 4. Get total document count for pagination metadata
    const total = await ContentModel.countDocuments(filter);

    // 5. Query one page of blogs, newest first by publishDateTime,
    //    and populate only author.fullName + author.image
    const blogs = await ContentModel.find(filter)
      .sort({ publishDateTime: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "author",
        select: "fullName image -_id"
      })
      .lean();

    // 6. Compute total pages
    const totalPages = Math.ceil(total / limit);

    // 7. Return structured JSON response
    return NextResponse.json(
      new ApiResponse(
        200,
        { items: blogs, page, totalPages, total },
        "Published blogs retrieved successfully"
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
