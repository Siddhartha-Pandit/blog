import SubscriberModel from "@/models/Subscriber";
import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";
import { ApiResponse } from "@/lib/ApiResponse";
import { ApiError } from "@/lib/ApiError";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
export async function POST(request:Request,
    { params }: { params: { creatorId:string } }
    
) {
    console.debug("Received POST request to add a new subscirber.");
    if(params.creatorId){
        console.error("creatorId is needed.")
        return NextResponse.json(new ApiError(400,"CreatorId is needed."),{status:400})
    }
    try{
        const session = await getServerSession(authOptions);
        const {email}=await request.json();
        let subscriberEmail=null;
        console.log("Session in routes.ts at suscriber->create:", session);
        if (session) {
            subscriberEmail=session?.user?.email;
            console.debug("User email is fetched from session");
        }
        else if(email){
            subscriberEmail=email;
            console.debug("User email is fetched from email parameter");
        }
        else{
            return NextResponse.json(new ApiError(400,"Either user should be logged in or the email should be provided in the parameter."))
        }
        await dbConnect();
        console.debug("Database connected.");
        const newSubscriber= new SubscriberModel({
            email: subscriberEmail,
            creatorId:params.creatorId
        })
        const savedSubscriber = await newSubscriber.save();
        if(savedSubscriber._id){
            console.debug("New Subscriber  created successfully:", savedSubscriber);
            return NextResponse.json(new ApiResponse(200,null,"User subscriber the creator."),{status:200});
        }
        else{
            console.error("Failed to save the subscriber. No _id returned.");
            return NextResponse.json(new ApiError(500,"Failed to subscribe the creator."))
        }
    }
    catch(error){
        console.error("Error while subscriber user:", error);
        return NextResponse.json(
            new ApiError(500,"Error while subscribering the creator"),
            {status:500}
        )

    }
}