import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import {eq , and } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server";
import {v4 as uuid} from "uuid"

export async function POST(request : NextRequest){
    try {
        const {userId} = await auth();

        if(!userId){
            return NextResponse.json({
                error : "unauthorized"
            } , {
                status : 401
            })
        }

        const body = await request.json()

        const {name , userId : bodyUserId , parentId = null} = body

        if(bodyUserId !== userId){
            return NextResponse.json({error : "Unauthorized"} , {status : 401})
        }

        if(!name || typeof name !== "string" || name.trim() === ""){
            return NextResponse.json(
                {
                    error : "folder name is required"
                },{
                    status : 401
                }
            )
        }

        if(parentId){
           const [parentFolder] = await db.select().from(files).where(
                and(
                    eq(files.id , parentId),
                    eq(files.userId , userId),
                    eq(files.isFolder , true)
                )
            )

            if(!parentFolder){
                return NextResponse.json({
                    error : "Parent folder not found"
                } , {
                    status : 401
                })
            }
        }

        const folderData = {
            id : uuid(),
            name : name.trim(),
            path : `/folder/${userId}/${uuid()}`,
            size : 0,
            type : "folder",
            fileUrl : "",
            thumbnailUrl : null,
            userId,
            parentId,
            isFolder : true,
            isStared : false ,
            isTrash : false
        }

        const [newFolder] = await db.insert(files).values(folderData).returning();

        return NextResponse.json({
            success : true ,
            message : "Folder created Successfully",
            folder : newFolder
        })
    } catch (error) {
        return NextResponse.json({
            success :false,
            message : "Error in creating folder"
        })
    }
}