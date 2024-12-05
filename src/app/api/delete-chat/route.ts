import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
  // Get user authentication
  const { userId } = await auth();

  // Check if user is authorized
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const { chatId } = await req.json(); // Get the chat ID from the request body

    // Mark the chat as deleted
    const result = await db.update(chats).set({ deleted: true }).where(eq(chats.id, chatId));

    if (result.count === 0) {
      return NextResponse.json({ error: "chat not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "chat deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error in deleting chat:", error.message);
    return NextResponse.json({ error: "internal server error" }, { status: 500 });
  }
}
