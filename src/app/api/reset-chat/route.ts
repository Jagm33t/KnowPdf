import { db } from "@/lib/db";
import { messages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
  try {
    const { chatId } = await req.json();

    if (!chatId) {
      return NextResponse.json({ error: "chatId is required" }, { status: 400 });
    }

    // Delete all messages associated with the given chatId (reset)
    const resetMessages = await db.delete(messages).where(eq(messages.chatId, chatId));

    if (resetMessages.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: "No messages found to reset for the provided chatId" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Chat reset successfully, all messages deleted." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in /api/reset-chat:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

