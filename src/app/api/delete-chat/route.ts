import { deleteS3File } from "@/lib/db/s3";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

interface DeleteChatBody {
  chatId: number;
  fileKey: string;

}

export async function DELETE(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body: DeleteChatBody = await req.json();
    const { chatId, fileKey } = body;

    console.log(`Received request to delete chat with ID: ${chatId}`);

    // Validate the existence of the chat
    const chat = await db
      .select()
      .from(chats)
      .where(and(eq(chats.id, chatId), eq(chats.userId, userId)))
      .limit(1);

    if (!chat || chat.length === 0) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Delete the file from S3
    const deleteFileResult = await deleteS3File(fileKey);
    if (!deleteFileResult.success) {
      return NextResponse.json({ error: "Failed to delete file from S3" }, { status: 500 });
    }

    // Delete the chat from the database
    await db.delete(chats).where(eq(chats.id, chatId));

    return NextResponse.json(
      { success: "Chat and file deleted successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in /api/delete-chat:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
