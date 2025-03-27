import SubscriberModel from "@/models/Subscriber";
import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import { ApiResponse } from "@/lib/ApiResponse";
import { ApiError } from "@/lib/ApiError";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

export async function DELETE(
  request: Request,
  { params }: { params: { subscriberId: string } }
) {
  console.debug("Received DELETE request to remove a subscriber.");

  // Check if subscriberId is provided in the parameters.
  if (!params.subscriberId) {
    console.error("SubscriberId is needed.");
    return NextResponse.json(
      new ApiError(400, "SubscriberId is needed."),
      { status: 400 }
    );
  }

  try {
    // Optionally, you can check if the user is logged in.
    const session = await getServerSession(authOptions);
    if (!session) {
      console.error("Unauthorized request: No token found.");
      return NextResponse.json(
        new ApiError(401, "User is unauthorized"),
        { status: 401 }
      );
    }
    console.debug("Authenticated user:", session.user.id);

    await dbConnect();
    console.debug("Database connected.");

    // Find the subscriber document by ID.
    const subscriber = await SubscriberModel.findById(params.subscriberId);
    if (!subscriber) {
      console.error("Subscriber not found.");
      return NextResponse.json(
        new ApiError(404, "Subscriber not found."),
        { status: 404 }
      );
    }

    // Delete the subscriber.
    await subscriber.deleteOne();
    console.debug("Subscriber removed successfully:", subscriber);

    return NextResponse.json(
      new ApiResponse(200, null, "Subscriber unsubscribed successfully."),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error while deleting subscriber:", error);
    return NextResponse.json(
      new ApiError(500, "Error while unsubscribing the creator."),
      { status: 500 }
    );
  }
}
