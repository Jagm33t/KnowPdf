"use client";
import { DrizzleChat } from "@/lib/db/schema";
import Link from "next/link";
import React from "react";
import { Button } from "./button";
import { MessageCircle, PlusCircle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";
import SubscriptionButton from "./SubscriptionButton";
import { toast } from "react-hot-toast";

type Props = {
  chats: DrizzleChat[];
  chatId: number;
  isPro: boolean;
};

const ChatSideBar = ({ chats, chatId, isPro }: Props) => {
  const [loading, setLoading] = React.useState(false);
  console.log("chats",chats);


  
  const handleDelete = async (chatId: number, fileKey: string, chats:DrizzleChat) => {
    try {
      setLoading(true);
      console.log("Deleting chat with ID:", chatId, "File Key:", fileKey);
      console.log("chats",chats);

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
    <div className="w-full h-screen p-4 text-gray-200 bg-gray-900">
      <Link href="/">
        <Button className="w-full border-dashed border-white border">
          <PlusCircle className="mr-2 w-4 h-4" />
          New Chat
        </Button>
      </Link>

      <div className="flex max-h-screen overflow-scroll pb-20 flex-col gap-2 mt-4">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className="flex items-center justify-between rounded-lg p-3 text-slate-300"
          >
            <Link href={`/chat/${chat.id}`}>
              <div
                className={cn("flex items-center", {
                  "bg-blue-600 text-white": chat.id === chatId,
                  "hover:text-white": chat.id !== chatId,
                })}
              >
                  <Button
              className="ml-2 text-red-500"
              onClick={() => handleDelete(chat.id, chat.fileKey)} // Pass chat.id and chat.fileKey
              disabled={loading}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
                <MessageCircle className="mr-2" />
                <p className="w-full overflow-hidden text-sm truncate whitespace-nowrap text-ellipsis">
                  {chat.pdfName}
                </p>
              </div>
            </Link>

            {/* Delete button */}
          
          </div>
        ))}

        <Button
          className="mt-2 text-white bg-slate-700"
          disabled={loading}
          onClick={async () => {
            setLoading(true);
            const response = await axios.get("/api/stripe/");
            window.location.href = response.data.url;
            setLoading(false);
          }}
        >
          Upgrade to Pro Plan
        </Button>

        <SubscriptionButton isPro={isPro} />
      </div>
    </div>
  );
};

export default ChatSideBar;
