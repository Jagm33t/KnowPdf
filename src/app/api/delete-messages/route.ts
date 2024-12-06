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

    // Delete all messages associated with the given chatId
    const deletedMessages = await db.delete(messages).where(eq(messages.chatId, chatId));

    return NextResponse.json(
      { success: true, message: "Messages deleted successfully", deletedMessages },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in /api/delete-messages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
