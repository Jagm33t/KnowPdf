"use client";
import { DrizzleChat } from "@/lib/db/schema";
import Link from "next/link";
import React from "react";
import { Button } from "./button";
import { MessageCircle, Plus, Trash2, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";
import { toast } from "react-hot-toast";
import SubscriptionButton from "./SubscriptionButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import FileUpload from "./FileUpload"; // Import FileUpload here

type Props = {
  chats: DrizzleChat[];
  chatId: string;
  isPro: boolean;
  className?: string;
};

const AppSidebar = ({ chats, chatId, isPro }: Props) => {
  const [loading, setLoading] = React.useState(false);
  const [openMenu, setOpenMenu] = React.useState<number | null>(null);

  const handleDelete = async (chatId: string, fileKey: string) => {
    try {
       
     
      console.log(loading)
      // Step 1: Delete the messages associated with the chatId
      const deleteMessagesResponse = await axios.delete("/api/delete-messages", {
        data: { chatId },
      });

      if (deleteMessagesResponse.status !== 200) {
        throw new Error("Failed to delete messages.");
      }

      // Send request to delete the PDF file from S3 using the fileKey
      const response = await axios.delete("/api/delete-chat", {
        data: { chatId, fileKey },
      });

      if (response.status === 200) {
        toast.success("File deleted successfully!");
        setTimeout(() => {
          window.location.reload(); 
        }, 2000);
      } else {
        toast.error("Failed to delete file.");
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("Error deleting file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen p-4 text-[#545454] bg-[#f8fafc]">
      {/* Avatar section */}
      <div className="flex items-center mb-4">
  <Link href="/">
    <div className="flex items-center cursor-pointer">
      <Avatar className="w-8 h-8 mt-1">
        <AvatarImage src="/chat-logo.png" className="object-cover" />
        <AvatarFallback>Scruby AI</AvatarFallback>
      </Avatar>
      <h1 className="text-xl text-black ml-1">Scruby AI</h1>
    </div>
  </Link>
</div>

      {/* Start New Chat Button */}
      <div className="w-full mb-4">
        <Dialog>
          <DialogTrigger asChild>
          <Button className="w-full text-white bg-[#33679c] hover:bg-[#192c56] hover:text-white border-gray-200 border">
            <Plus className="mr-2 w-4 h-4" /> 
           Start  New Chat
          </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Start New Chat</DialogTitle>
              <DialogDescription>
                Please upload a PDF to start a new chat. Only PDF files are accepted.
              </DialogDescription>
            </DialogHeader>
            <FileUpload isPro={isPro}/> {/* Directly call FileUpload inside the dialog */}
          </DialogContent>
        </Dialog>
      </div>

      {/* Chat list */}
      <div className="flex max-h-screen overflow-scroll pb-20 flex-col gap-1 mt-4">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className="flex items-center justify-between rounded-lg p-1 text-slate-600"
          >
            <Link href={`/chat/${chat.id}`}>
              <div
                className={cn("flex items-center rounded-md", {
                  "bg-[#e9ecef] text-slate-700 font-bold": chat.id === parseInt(chatId),
                  "hover:text-[#080808]": chat.id !== parseInt(chatId),
                })}
              >
                <MessageCircle className="mr-1 w-3" />
                <p
                  className="text-xs truncate overflow-hidden whitespace-nowrap"
                  style={{ maxWidth: "150px" }}
                  title={chat.pdfName}
                >
                  {chat.pdfName}
                </p>
                
              </div>
            </Link>
            <div className="relative">
                  <Button
                    variant="ghost"
                    className="p-1"
                    onClick={() =>
                      setOpenMenu((prev) => (prev === chat.id ? null : chat.id))
                    }
                  >
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                  {openMenu === chat.id && (
                    <div className="absolute right-0 mt-2 w-40 bg-gray-100 shadow-md rounded-lg">
                      <div
                        className="p-2 text-red-500 cursor-pointer hover:bg-gray-300 flex items-center"
                        onClick={() => {
                          setOpenMenu(null);
                          handleDelete(chat.id.toString(), chat.fileKey);
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </div>
                    </div>
                  )}
                </div>
          </div>
        ))}
      </div>

      {/* Upgrade and Subscription buttons */}
      <div className="w-full mt-auto space-y-2">
        {/* <Button
          className=" w-full text-white bg-[#192c56] hover:bg-[#33679c] hover:text-white border-gray-200 border"
          disabled={loading}
          onClick={async () => {
            setLoading(true);
            const response = await axios.get("/api/stripe/");
            window.location.href = response.data.url;
            setLoading(false);
          }}
        >
          Upgrade to Pro Plan
        </Button> */}
        <SubscriptionButton isPro={isPro} />
      </div>
    </div>
  );
};

export default AppSidebar;
