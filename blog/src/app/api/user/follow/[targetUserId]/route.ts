import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { ApiResponse } from "@/lib/ApiResponse";
import { ApiError } from "@/lib/ApiError";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import mongoose from "mongoose";

export async function PUT(
  req: Request,
  { params }: { params: { targetUserId: string } }
) {
  console.debug("Received PUT request to update follow status for target user:", params.targetUserId);

  const session = await getServerSession(authOptions);
  if (!session) {
    console.error("Unauthorized request: No session found.");
    return NextResponse.json(new ApiError(401, "User is unauthorized"), { status: 401 });
  }
  const currentUserId = session.user.id;
  console.debug("Authenticated user:", currentUserId);

  if (!params.targetUserId) {
    console.error("Missing targetUserId in URL parameters.");
    return NextResponse.json(new ApiError(400, "Target user id is required."), { status: 400 });
  }
  if (params.targetUserId === currentUserId) {
    console.error("User cannot follow themselves.");
    return NextResponse.json(new ApiError(400, "You cannot follow yourself."), { status: 400 });
  }

  try {
    await dbConnect();
    console.debug("Database connection established.");

    const currentUser = await UserModel.findById(currentUserId);
    const targetUser = await UserModel.findById(params.targetUserId);

    if (!currentUser || !targetUser) {
      console.error("One or both users not found. Current:", currentUserId, "Target:", params.targetUserId);
      return NextResponse.json(new ApiError(404, "User not found."), { status: 404 });
    }

    const followingIndex = currentUser.following.findIndex(
      (followId) => followId.toString() === params.targetUserId
    );
    let followStatus: boolean;

    if (followingIndex !== -1) {
      currentUser.following.splice(followingIndex, 1);
      const followerIndex = targetUser.followers.findIndex(
        (followerId) => followerId.toString() === currentUserId
      );
      if (followerIndex !== -1) {
        targetUser.followers.splice(followerIndex, 1);
      }
      followStatus = false;
      console.debug(`User ${currentUserId} unfollowed target user ${params.targetUserId}.`);
    } else {
      currentUser.following.push(new mongoose.Types.ObjectId(params.targetUserId));
      targetUser.followers.push(new mongoose.Types.ObjectId(currentUserId));
      followStatus = true;
      console.debug(`User ${currentUserId} followed target user ${params.targetUserId}.`);
    }

    await currentUser.save();
    await targetUser.save();

    return NextResponse.json(
      new ApiResponse(
        200,
        {
          followStatus,
          followingCount: currentUser.following.length,
          followerCount: targetUser.followers.length,
        },
        "Follow status updated successfully."
      ),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating follow status:", error);
    return NextResponse.json(
      new ApiError(500, "Error updating follow status"),
      { status: 500 }
    );
  }
}
