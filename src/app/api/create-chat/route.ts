import { db } from "@/lib/db";
import { deleteFromS3 } from "@/lib/db/s3"; 
import { chats } from "@/lib/db/schema";
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
    const { chatId, fileKey } = body;

    // Delete the file from S3
    await deleteFromS3(fileKey);

    // Delete the chat record from the database
    const deletedChat = await db.delete(chats).where({ id: chatId });

    if (!deletedChat) {
      throw new Error("Failed to delete chat from the database");
    }

    return NextResponse.json(
      { message: "Chat deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in /api/delete-chat:", error.message);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}
