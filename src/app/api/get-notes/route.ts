import { db } from "@/lib/db";
import { notes } from "@/lib/db/schema";
import { NextResponse } from "next/server";
import { sql } from "drizzle-orm"; // Import sql for custom queries

export async function GET(req: Request) {
  const url = new URL(req.url);
  const chatId = url.searchParams.get("chatId");

  if (!chatId) {
    return NextResponse.json({ error: "chatId is required" }, { status: 400 });
  }

  try {
    // Fetch the note using `sql` for the condition
    const note = await db
      .select()
      .from(notes)
      .where(sql`${notes.chatId} = ${chatId}`) // Use sql for the condition
      .limit(1);

    if (note.length > 0) {
      return NextResponse.json(note[0], { status: 200 });
    } else {
      return NextResponse.json({ message: "Note not found for this chat" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json({ error: "internal server error" }, { status: 500 });
  }
}
