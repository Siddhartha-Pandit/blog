import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import CommentModel from "@/models/Comment";
import { ApiResponse } from "@/lib/ApiResponse";
import { ApiError } from "@/lib/ApiError";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { getServerSession } from "next-auth";
import mongoose from "mongoose"; 

export async function PUT(req: Request, { params }: { params: { blogId: string,commentId:string } }) {
    console.debug("Received PUT request to update like blog:", params.blogId,params.commentId);

    const session = await getServerSession(authOptions);
    if (!session) {
        console.error("Unauthorized request: No token found.");
        return NextResponse.json(new ApiError(401, "User is unauthorized"), { status: 401 });
    }
    console.debug("Authenticated user:", session.user.id);
    try{
        if (!params.blogId || !params.commentId) {
            console.error("Blog id missing in URL parameters.");
            return NextResponse.json(new ApiError(400, "Blog id is required for update"), { status: 400 });
        }

        await dbConnect();
        console.debug("Database connection established.");
        const comment = await CommentModel.findOne({_id:params.commentId,contentId:params.blogId,userId:session.user.id});
        if (!comment) {
          console.debug("comment  not found");
          return NextResponse.json(
            new ApiError(404, "Comment not found."),
            { status: 404 }
          );
        }
        const userId=session.user.id;
        const likeIndex=comment.likes.findIndex((like) => like.toString() === userId);
        let likeStatus=false;
        if(likeIndex!==-1){
            comment.likes.splice(likeIndex,1);
            likeStatus=false;
        }
        else{
            comment.likes.push(new mongoose.Types.ObjectId(userId));
            console.debug(`Added user ${userId} to likes.`);
            likeStatus=true
            await comment.save();
            return NextResponse.json(new ApiResponse(200,{likeCount:comment.likes.length,likeStatus},"Like status updated successfully."), { status: 200 });
        }
    }
    catch(error){
        console.error("Error updating like status in comments:", error);
        return NextResponse.json(new ApiError(500, "Error updating like status in comments"), { status: 500 });
    }
}