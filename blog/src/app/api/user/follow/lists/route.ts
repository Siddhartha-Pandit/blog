import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { ApiResponse } from "@/lib/ApiResponse";
import { ApiError } from "@/lib/ApiError";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

export async function GET() {
  console.debug("Received GET request for follow lists.");

  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      console.error("Unauthorized request: No session found.");
      return NextResponse.json(new ApiError(401, "User is unauthorized"), { status: 401 });
    }
    const userId = session.user.id;
    console.debug("Authenticated user:", userId);

    await dbConnect();
    console.debug("Database connection established.");

    const user = await UserModel.findById(userId)
      .populate("followers", "fullName userName email image")
      .populate("following", "fullName userName email image");

    if (!user) {
      console.error("User not found:", userId);
      return NextResponse.json(new ApiError(404, "User not found."), { status: 404 });
    }

    const followersList = user.followers;
    const followingList = user.following;
    const followerCount = Array.isArray(followersList) ? followersList.length : 0;
    const followingCount = Array.isArray(followingList) ? followingList.length : 0;

    return NextResponse.json(
      new ApiResponse(
        200,
        { followers: followersList, following: followingList, followerCount, followingCount },
        "Follow lists retrieved successfully."
      ),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving follow lists:", error);
    return NextResponse.json(new ApiError(500, "Error retrieving follow lists"), { status: 500 });
  }
}
