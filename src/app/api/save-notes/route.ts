import { db } from "@/lib/db";
import { notes } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { sql } from "drizzle-orm"; // Import sql for comparisons

export async function POST(req: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { chatId, content } = body;

    if (!chatId || !content) {
      return NextResponse.json({ error: "chatId and content are required" }, { status: 400 });
    }

    // Check if a note already exists for this chat
    const existingNote = await db
      .select()
      .from(notes)
      .where(sql`${notes.chatId} = ${chatId}`) // Use sql tag for comparison
      .limit(1);

    // If a note exists, update it
    if (existingNote.length > 0) {
      await db.update(notes).set({ content, updatedAt: new Date() }).where(sql`${notes.chatId} = ${chatId}`);
      return NextResponse.json({ message: "Note updated successfully" }, { status: 200 });
    } else {
      // If no note exists, insert a new one
      const newNote = await db.insert(notes).values({ chatId, content }).returning(); // Ensure we return the inserted row
      return NextResponse.json({ message: "Note saved successfully", note: newNote }, { status: 201 });
    }
  } catch (error) {
    console.error("Error saving note:", error);
    return NextResponse.json({ error: "internal server error" }, { status: 500 });
  }
}
