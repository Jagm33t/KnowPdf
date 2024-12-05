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

  // Handle the delete action
  const handleDelete = async (chatId: number) => {
    try {
      setLoading(true);
      // Call API to delete the file from S3 and delete chat record from DB
      const response = await axios.post("/api/delete-chat", { chatId});
      console.log("request delte made")
      if (response.status === 200) {
        toast.success("Chat deleted successfully!");
      } else {
        toast.error("Failed to delete chat.");
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast.error("Error deleting chat.");
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
                <MessageCircle className="mr-2" />
                <p className="w-full overflow-hidden text-sm truncate whitespace-nowrap text-ellipsis">
                  {chat.pdfName}
                </p>
              </div>
            </Link>

            {/* Delete button */}
            <Button
              className="ml-2 text-red-500"
              onClick={() => handleDelete(chat.id)} // pass the chat id and file key for deletion
              disabled={loading}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
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
