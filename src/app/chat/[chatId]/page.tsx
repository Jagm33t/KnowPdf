import AppSidebar from "@/components/ui/AppSidebar";
import ChatComponent from "@/components/ui/ChatComponent";
import PDFViewer from "@/components/ui/PDFViewer";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { checkSubscription } from "@/lib/subscription";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

const ChatPage = async ({ params }: { params: Promise<{ chatId: string }> }) => {
  const { chatId } = await params; // Await the promise to extract `chatId`

  const { userId } = await auth();
  if (!userId) {
    return redirect("/sign-in");
  }

  const _chats = await db.select().from(chats).where(eq(chats.userId, userId));
  if (!_chats) {
    return redirect("/");
  }
  if (!_chats.find((chat) => chat.id === parseInt(chatId))) {
    return redirect("/");
  }

  const currentChat = _chats.find((chat) => chat.id === parseInt(chatId));
  const isPro = await checkSubscription();
  const pdfUrl = currentChat?.pdfUrl || "";

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex w-full h-screen overflow-hidden">
        {/* Chat Sidebar */}
        <div className="flex-[1] max-w-xs">
          <AppSidebar chats={_chats} chatId={chatId} isPro={isPro} />
        </div>

        {/* PDF Viewer */}
        <div className="max-h-screen p-4 overflow-scroll flex-[3]">
          <PDFViewer pdf_url={pdfUrl} />
        </div>

        {/* Chat Component */}
        <div className="flex-[3] border-l-2 border-l-gray-300 bg-[#F3F2F1]">
          <ChatComponent chats={_chats} chatId={chatId} />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
