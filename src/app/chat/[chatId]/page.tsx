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

  // Get the pdfUrl for the current chat
  const pdfUrl = currentChat?.pdfUrl || "";


  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex w-full h-screen overflow-hidden">
        {/* Chat Sidebar */}
        <div className="flex-[1] max-w-xs">
          <ChatSideBar chats={_chats} chatId={parseInt(chatId)} isPro={isPro} />
        </div>
        
        {/* PDF Viewer */}
        <div className="max-h-screen p-4 overflow-scroll flex-[3]">
          <PDFViewer pdf_url={pdfUrl} />
        </div>

        {/* Chat Component */}
        <div className="flex-[3] border-l-2 border-l-gray-300 bg-[#F3F2F1]">
          <ChatComponent chats={_chats} chatId={parseInt(chatId)} />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
