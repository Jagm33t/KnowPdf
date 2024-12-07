"use client";
import { DrizzleChat } from "@/lib/db/schema";
import Link from "next/link";
import React from "react";
import { Button } from "./button";
import { MessageCircle, PlusCircle, Trash2, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";
// import SubscriptionButton from "./SubscriptionButton";
import { toast } from "react-hot-toast";

type Props = {
  chats: DrizzleChat[];
  chatId: number;
  isPro: boolean;
};

const ChatSideBar = ({ chats, chatId}: Props) => {
  const [loading, setLoading] = React.useState(false);
  const [openMenu, setOpenMenu] = React.useState<number | null>(null);

  const handleDelete = async (chatId: number, fileKey: string) => {
    try {
      setLoading(true);
      console.log("Deleting chat with ID:", chatId, "File Key:", fileKey);

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
    <div className="w-full h-screen p-4 text-black bg-gray-100">
      <Link href="/">
        <Button className="w-full border-dashed hover:bg-gray-300  text-black bg-gray-100 border-gray border">
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
                  "bg-gray-100 text-black": chat.id === chatId,
                  "hover:text-black": chat.id !== chatId,
                })}
              >
                <MessageCircle className="mr-2" />
                <p
                  className="text-sm truncate overflow-hidden whitespace-nowrap"
                  style={{ maxWidth: "150px" }} // Adjust the maxWidth to your preference
                    title={chat.pdfName} // Tooltip to show full name
                  >
                       {chat.pdfName}
                      </p>
              </div>
            </Link>

            {/* Dropdown Menu */}
            <div className="relative">
              <Button
                variant="ghost"
                className="p-2"
                onClick={() =>
                  setOpenMenu((prev) => (prev === chat.id ? null : chat.id))
                }
              >
                <MoreVertical className="w-5 h-5" />
              </Button>
              {openMenu === chat.id && (
                <div className="absolute right-0 mt-2 w-40 bg-gray-50 shadow-md rounded-lg">
                  <div
                    className="p-2 text-red-500 cursor-pointer hover:bg-gray-300 flex items-center"
                    onClick={() => {
                      setOpenMenu(null);
                      handleDelete(chat.id, chat.fileKey);
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

        <Button
          className="mt-2 bg-slate-600"
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


      </div>
    </div>
  );
};

export default ChatSideBar;
