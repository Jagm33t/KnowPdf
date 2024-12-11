'use client';

import React, { useEffect, useState } from "react";
import { Input } from "./input";
import { useChat } from "ai/react";
import { Button } from "./button";
import { Send, Share, Download, RefreshCw, Trash } from "lucide-react"; // ShadCN (Lucide) icons
import MessageList from "./MessageList";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Message } from "ai";
import { toast } from "react-hot-toast";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  chatId: number;
}

const ChatComponent = ({ chatId }: Props) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [shareableLink, setShareableLink] = useState<string>("");

  // Fetching messages via useQuery
  const { data, isLoading, refetch  } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: async () => {
      const response = await axios.post<Message[]>("/api/get-messages", {
        chatId,
      });
      return response.data;
    },
  });

  // Chat hook initialization
  const { input, handleInputChange, handleSubmit, messages, setInput } = useChat({
    api: "/api/chat",
    body: {
      chatId,
    },
    initialMessages: data || [],
  });

  // Generate shareable link on component mount
  useEffect(() => {
    setShareableLink(`${window.location.origin}/share-chat/${chatId}`);
  }, [chatId]);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    const messageContainer = document.getElementById("message-container");
    if (messageContainer) {
      messageContainer.scrollTo({
        top: messageContainer.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  // Handle download chat functionality
  const handleDownloadChat = () => {
    if (messages.length === 0) {
      toast.error("No messages to download.");
      return;
    }

    const chatContent = messages
      .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
      .join("\n\n");

    const blob = new Blob([chatContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `chat-${chatId}.txt`;
    link.click();

    // Clean up the object URL
    URL.revokeObjectURL(url);
  };

   // Handle Reset Chat
   const handleResetChat = async () => {
    const loadingToast = toast.loading("Resetting chat...");
  
    try {
      const response = await axios.delete("/api/reset-chat", {
        data: { chatId },
      });
  
      if (response.data.success) {
        toast.dismiss(loadingToast);
        toast.success("Chat reset successfully!");
        refetch(); // Refetch messages to ensure the UI is updated
      } else {
        toast.dismiss(loadingToast);
        toast.error(response.data.message || "Failed to reset chat.");
      }
    } catch (error) {
      console.error("Error resetting chat:", error);
      toast.dismiss(loadingToast);
      toast.error("An error occurred while resetting the chat.");
    }
  };
  

  
  


  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="flex justify-between sticky top-0 inset-x-0 p-2 bg-white">
        <h3 className="text-xl">Chat</h3>
        <div className="flex gap-4">
          {/* Share Button */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <button className="hover:text-[#33679c]" title="Share chat">
                <Share className="w-5" />
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogTitle>Share this chat</DialogTitle>
              <p className="text-sm text-gray-500 mb-4">
                Anyone with this link can chat with your document.
              </p>
              <div className="flex items-center gap-2 bg-gray-50">
                <input
                  type="text"
                  value={shareableLink}
                  readOnly
                  className="flex-1 border px-2 py-1 rounded"
                />
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(shareableLink);
                    toast.success("Link Copied");
                  }}
                  className="w-full hover:bg-gray-100 bg-white text-black border-black border"
                >
                  Copy Link
                </Button>
                <Button
                  className="w-full hover:bg-gray-100 bg-white text-black border-black border"
                  onClick={() =>
                    window.open(
                      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareableLink)}`,
                      "_blank"
                    )
                  }
                >
                  Share on Facebook
                </Button>
                <Button
                  className="w-full hover:bg-gray-100 bg-white text-black border-black border"
                  onClick={() =>
                    window.open(
                      `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareableLink)}`,
                      "_blank"
                    )
                  }
                >
                  Share on X
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Download Icon with Hover Text */}
          <div className="group relative flex items-center">
            <button
              className="hover:text-[#33679c]"
              title="Download chat"
              onClick={handleDownloadChat}
            >
              <Download className="w-5" />
            </button>
          </div>

          {/* Refresh Icon with Hover Text */}
          <div className="group relative flex items-center">
            <button className="hover:text-[#33679c]" title="Reset chat" onClick={handleResetChat}>
              <RefreshCw className="w-5" />
            </button>
          </div>

        </div>
      </div>

      {/* Message List */}
      <div id="message-container" className="flex-1 overflow-y-auto px-4 py-2">
        <MessageList messages={messages} isLoading={isLoading} />
      </div>

      {/* Buttons for Predefined Prompts */}
      <div className="w-full bg-white px-5 py-3 flex gap-2">
        <Button
          className="bg-white hover:bg-[#f6f5f8] text-[#314862] border-[#f6f5f8] border"
          onClick={() => setInput("Summarize the content.")}
        >
          Summarize
        </Button>
        <Button
          className="bg-white hover:bg-[#f6f5f8] text-[#314862] border-[#f6f5f8] border"
          onClick={() => setInput("Highlight important information in the content.")}
        >
          Highlight
        </Button>
        <Button
          className="bg-white hover:bg-[#f6f5f8] text-[#314862] border-[#f6f5f8] border"
          onClick={() => setInput("Simplify the content.")}
        >
          Simplify
        </Button>
        <Button
          className="bg-white hover:bg-[#f6f5f8] text-[#314862] border-[#f6f5f8] border"
          onClick={() => setInput("Enhance the content.")}
        >
          Enhance
        </Button>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="w-full bg-white px-5 py-4">
        <div className="flex items-center">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask any question..."
            className="w-full"
            maxLength={800}
          />
          <Button type="submit" className="bg-[#192c56] ml-2">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatComponent;
