import ChatSideBar from "@/components/ui/ChatSideBar";
import PDFViewer from "@/components/ui/PDFViewer";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
// import { checkSubscription } from "@/lib/subscription";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import React from "react";

interface Props {
  params: {
    chatId: string;
  };
}

const ChatPage = async ({ params: { chatId } }: Props) => {
  // Authenticate user
  const { userId } = await auth();
  if (!userId) {
    return redirect("/sign-in");
  }

  // Fetch chats for the authenticated user
  const _chats = await db.select().from(chats).where(eq(chats.userId, userId));
  // console.log("_chats:", _chats); // Log all chats for the user

  // Redirect if no chats are found
  if (!_chats) {
    return redirect("/");
  }

  // Find the chat with the provided chatId
  const currentChat = _chats.find((chat) => chat.id === parseInt(chatId));
  // console.log("currentChat:", currentChat); // Log the selected chat

  // If chat not found, redirect
  if (!currentChat) {
    return redirect("/");
  }

  // Log the pdfUrl for debugging
  const pdfUrl = currentChat?.pdfUrl || "";
  console.log("PDF URL:", pdfUrl); // Log the actual PDF URL

  return (
    <div className="flex max-h-screen overflow-scroll">
      <div className="flex w-full max-h-screen overflow-scroll">
        {/* chat sidebar */}
        <div className="flex-[1] max-w-xs">
          <ChatSideBar chats={_chats} chatId={parseInt(chatId)} />
        </div>
        {/* pdf viewer */}
        <div className="max-h-screen p-4 oveflow-scroll flex-[5]">
          <PDFViewer pdf_url={pdfUrl} />
        </div>
        {/* chat component */}
        <div className="flex-[3] border-l-4 border-l-slate-200">
          {/* <ChatComponent chatId={parseInt(chatId)} /> */}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
