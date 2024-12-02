import { db } from "@/lib/db";
import { getS3Url } from "@/lib/db/s3";
import { chats } from "@/lib/db/schema";
import { loadS3IntoPinecone } from "@/lib/pinecone";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // Get user authentication
  const { userId } = await auth();

  // Check if user is authorized
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    // console.log("Request Body:", body);
    const { file_key, file_name } = body;

    // console.log("Calling loadS3IntoPinecone");
    await loadS3IntoPinecone(file_key);

    // console.log("Inserting chat into database");
    const chat_id =await db.insert(chats).values({
      fileKey: file_key,
      pdfName: file_name,
      pdfUrl: getS3Url(file_key),
      userId,
    }).returning({
      insertId: chats.id,
    });
    
    // Use `insertId` instead of `insertedId`
  

    if (!chat_id) {
      throw new Error("Failed to insert chat");
    }

    return NextResponse.json(
      { 
        chat_id: chat_id[0].insertedId,
       },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in /api/create-chat:", error.message);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}
