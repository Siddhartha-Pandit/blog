import { ApiResponse } from "@/lib/ApiResponse";
import { ApiError } from "@/lib/ApiError";
import ContentModel from "@/models/Content";
import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";
export async function GET(req: Request,{params}:{params:{blogId: string}}) {
    console.debug("Received GET request to read blog:", params.blogId);
    try{
        if(!params.blogId){
            console.error("Blog id missing in URL parameters.");
            return NextResponse.json(new ApiError(400,"Blog id is required for read"),{status:400});
        }
        await dbConnect();
        console.debug("Database connection established.");
        const blog = await ContentModel.findOne({_id:params.blogId});
        if(!blog){
            console.error("Blog not found:", params.blogId);
            return NextResponse.json(new ApiError(404,"Blog not found"),{status:404});
        }
        return NextResponse.json(new ApiResponse(200,blog,"Blog read successfully"),{status:200});
    }
    catch(error){
        console.error("Error while reading the blog:", error);
        return NextResponse.json(new ApiError(500,"Error while reading the blog"),{status:500});
    }
}
