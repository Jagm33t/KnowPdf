import ChatSideBar from "@/components/ui/ChatSideBar";
import ChatComponent from "@/components/ui/ChatComponent";
import PDFViewer from "@/components/ui/PDFViewer";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { checkSubscription } from "@/lib/subscription";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import React from "react";

interface Props {
  params: {
    chatId: string;
  };
}

const ChatPage = async ({ params }: Props) => {

  const { chatId } = await params; 
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
  const isPro = await checkSubscription();

  // If chat not found, redirect
  if (!currentChat) {
    return redirect("/");
  }

  // Log the pdfUrl for debugging
  const pdfUrl = currentChat?.pdfUrl || "";


  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex w-full h-screen overflow-hidden">
        {/* chat sidebar */}
        <div className="flex-[1] max-w-xs">
        <ChatSideBar chats={_chats} chatId={parseInt(chatId)} isPro={isPro} />
        </div>
        {/* pdf viewer */}
        <div className="max-h-screen p-4 oveflow-scroll flex-[3]">
          <PDFViewer pdf_url={pdfUrl} />
        </div>
        {/* chat component */}
        <div className="flex-[3] border-l-4 border-l-slate-200">
          <ChatComponent chatId={parseInt(chatId)} />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
