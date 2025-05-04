// app/api/blog/user/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/authOptions";
import dbConnect from "@/lib/dbConnect";
import ContentModel from "@/models/Content";
import { ApiResponse } from "@/lib/ApiResponse";
import { ApiError } from "@/lib/ApiError";
import UserModel from "@/models/User";

export async function GET(req: Request) {
  try {
    // 1) Authenticate & get session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        new ApiError(401, "Unauthorized"),
        { status: 401 }
      );
    }
    await dbConnect();
    const providerId = session.user.id;
    const user=await UserModel.findOne({providerId:providerId});
    const userId=user?.id
    // 2) Connect to database
    

    // 3) Parse optional pagination parameters
    const { searchParams } = new URL(req.url);
    const page  = Math.max(1, parseInt(searchParams.get("page")  || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "10", 10));
    const skip  = (page - 1) * limit;

    // 4) Build filter to only this user's content
    const filter = { author: userId };

    // 5) Count total for pagination metadata
    const total = await ContentModel.countDocuments(filter);

    // 6) Fetch the page, sort by createdAt desc, populate author info if desired
    const items = await ContentModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({ path: "author", select: "fullName image -_id" })
      .lean();

    // 7) Compute pages and return
    const totalPages = Math.ceil(total / limit);
    return NextResponse.json(
      new ApiResponse(
        200,
        { items, page, totalPages, total },
        "Your blogs retrieved successfully"
      ),
      { status: 200 }
    );
  } catch (err) {
    console.error("Error fetching user blogs:", err);
    return NextResponse.json(
      new ApiError(500, "Error fetching your blogs"),
      { status: 500 }
    );
  }
}
