import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { uploadOnCloudinary } from "@/lib/cloudinary";
import fs from "fs/promises";
import path from "path";
import dbConnect from "@/lib/dbConnect";
import { ApiResponse } from "@/lib/ApiResponse";
import { ApiError } from "@/lib/ApiError";
import ContentModel from "@/models/Content";
import MediaModel from "@/models/Media";
export async function POST(req: Request,
    { params }: { params: { blogId: string } })
{
    console.debug("Recieved the POST request to upload the media")
    const session=await getServerSession(authOptions);
        if(!session){
            console.error("Unauthorized request: No token found.");
            return NextResponse.json(new ApiError(401, "user is unauthorized"),{status:401});
        }
        console.debug("Authenticated user:", session.user.id);
        if(!params.blogId){
            console.error("Blog id missing in URL parameters.");
            return NextResponse.json(new ApiError(400,"Blog id is required for update"),{status:400});
        }
        try{
            
            await dbConnect();
            console.debug("Database connection established.");
        }
        catch (error){
            console.error("Database connection established.",error);
            return NextResponse.json(
            new ApiError(500, "Database connection error"),{status:500}
            );

        }
        try{
            const formData=await req.formData();
            const fileField=formData.get("file");
            if(!fileField ||  !(fileField instanceof File)){
                console.error("No file provided in the request.")
                return NextResponse.json(new ApiError(400,"No file provided."),{status:400})
            }
            const buffer=Buffer.from(await fileField.arrayBuffer());
            const tempDir=path.join(process.cwd(), "blog", "public", "temp");
            try{
                await fs.access(tempDir);
            }
            catch{
                await fs.mkdir(tempDir, { recursive: true });
            }
            const filename = `${Date.now()}-${fileField.name}`;
            const localFilePath = path.join(tempDir, filename);
            await fs.writeFile(localFilePath, buffer);
            const cloudinaryResponse=await uploadOnCloudinary(localFilePath);
            console.debug("File uploaded to Cloudinary:", cloudinaryResponse);
            //save it on database
            const blog= await ContentModel.findOne({_id:params.blogId,author:session.user.id})
            if(!blog){
                console.error("Blog not found or unauthorized user to update the blog.");
                return NextResponse.json(new ApiError(400,"No blogs found for you"));
            }
            const newMedia=new MediaModel({
                name: fileField.name,
                contentId: params.blogId,
                link: cloudinaryResponse?.secure_url
            });
            const savedContent = await newMedia.save();

            console.debug("Media record saved:", newMedia);
            if(!savedContent.id){
                return NextResponse.json(new ApiError(500,"Content not saved in the database"))
            }

            return NextResponse.json(
                new ApiResponse(200, cloudinaryResponse,"File uploaded successfully")
              );        
            }
        catch(err){
            console.error("Database connection established.",err);
            return NextResponse.json(new ApiError(500,"File upload error"),{status:500})
        }
}