import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import {getContext} from "@/lib/context";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { chats, messages as _messages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "edge"; // Ensure compatibility with Edge Runtime

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function POST(req: Request) {
  try {
    // Parse the incoming request body
    const { messages, chatId } = await req.json();
    // console.log("chatidddddddddd", chatId)
    const _chats = await db.select().from(chats).where(eq(chats.id, chatId));
    if (_chats.length != 1) {
      return NextResponse.json({ error: "chat not found" }, { status: 404 });
    }
    const fileKey = _chats[0].fileKey;
    const lastMessage = messages[messages.length - 1];
    const context = await getContext(lastMessage.content, fileKey);

    const prompt = {
      role: "system",
      content: `Use the following pieces of context and previous conversation (if applicable) to answer the user's question in markdown format.
      If the question refers to an uploaded PDF, file, or document, extract and summarize the relevant information from the content of the uploaded file.
      If the context does not provide the answer, respond with something like "I'm not sure about that. Could you try asking in more detail or refine your question? Alternatively, the information might not be available at the moment." Aim to provide helpful guidance and maintain a conversational tone.
    
      ----------------
      PREVIOUS CONVERSATION:
      ${messages
      .filter((message: Message) => message.role !== "system")
      .map((message: Message) => {
          return message.role === "user"
            ? `User: ${message.content}\n`
            : `System: ${message.content}\n`;
        })
        .join("")}
    
      ----------------
      CONTEXT:
      ${context}
    
      USER INPUT: ${lastMessage.content}`,
    };
    
    
    // Use the streamText function with the OpenAI model
    const result = streamText({
      model: openai("gpt-3.5-turbo"), 
      messages: [
        prompt,
        ...messages.filter((message: Message) => message.role === "user"),
      ],
      temperature: 0.3,
      async onFinish({ text, toolCalls, toolResults, finishReason, usage }) {
        // Store the user message and AI response to the database
        // Store user message
        await db.insert(_messages).values({
          chatId,
          content: lastMessage.content,
          role: "user",
        });

        // Store AI response
        await db.insert(_messages).values({
          chatId,
          content: text,
          role: "system",
        });

        // Optional: log tool calls or results if necessary
        console.log({ toolCalls, toolResults, finishReason, usage });
      },
    });

    // Return the result as a streaming response
    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Error processing OpenAI stream:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}