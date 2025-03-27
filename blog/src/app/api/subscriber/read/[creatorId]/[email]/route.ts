import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import SubscriberModel from "@/models/Subscriber";
import { ApiResponse } from "@/lib/ApiResponse";
import { ApiError } from "@/lib/ApiError";

export async function GET(
  { params }: { params: { creatorId: string; email: string } }
) {
  if (!params.creatorId || !params.email) {
    return NextResponse.json(
      new ApiError(400, "Both creatorId and email are required."),
      { status: 400 }
    );
  }

  try {
    await dbConnect();

    const subscriber = await SubscriberModel.findOne({
      creatorId: params.creatorId,
      email: params.email,
    });

    const isSubscribed = !!subscriber; 

    return NextResponse.json(
      new ApiResponse(200, { isSubscribed }, "Subscription status retrieved successfully."),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving subscriber:", error);
    return NextResponse.json(
      new ApiError(500, "Error retrieving subscriber"),
      { status: 500 }
    );
  }
}
