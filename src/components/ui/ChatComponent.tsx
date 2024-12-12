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
import NotesEditor from "./NotesEditor";

interface Props {
  chatId: number;
}

const ChatComponent = ({ chatId }: Props) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [shareableLink, setShareableLink] = useState<string>("");
  const [activeView, setActiveView] = useState<"Analyze" | "Notes">("Analyze");

  // Fetching messages via useQuery
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: async () => {
      const response = await axios.post<Message[]>("/api/get-messages", {
        chatId,
      });
      return response.data;
    },
  });

  const { input, handleInputChange, handleSubmit, messages, setInput } = useChat({
    api: "/api/chat",
    body: {
      chatId,
    },
    initialMessages: data || [],
  });

  useEffect(() => {
    setShareableLink(`${window.location.origin}/share-chat/${chatId}`);
  }, [chatId]);

  useEffect(() => {
    const messageContainer = document.getElementById("message-container");
    if (messageContainer) {
      messageContainer.scrollTo({
        top: messageContainer.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

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

    URL.revokeObjectURL(url);
  };

  const handleResetChat = async () => {
    const loadingToast = toast.loading("Resetting chat...");

    try {
      const response = await axios.delete("/api/reset-chat", {
        data: { chatId },
      });

      if (response.data.success) {
        toast.dismiss(loadingToast);
        toast.success("Chat reset successfully!");
        refetch();
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
        <div className="flex gap-4">
        <Button
    className={`${
      activeView === "Analyze"
        ? "bg-[#33679c] text-white hover:bg-[#33679c]"
        : "bg-white text-black hover:bg-gray-200"
    }`}
    onClick={() => setActiveView("Analyze")}
  >
    Analyze
  </Button>
  <Button
    className={`${
      activeView === "Notes"
        ? "bg-[#33679c] text-white hover:bg-[#33679c]"
        : "bg-white text-black hover:bg-gray-200"
    }`}
    onClick={() => setActiveView("Notes")}
  >
    Notes
          </Button>
        </div>
        <div className="flex gap-4">
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
              </div>
            </DialogContent>
          </Dialog>
          <button
            className="hover:text-[#33679c]"
            title="Download chat"
            onClick={handleDownloadChat}
          >
            <Download className="w-5" />
          </button>
          <button
            className="hover:text-[#33679c]"
            title="Reset chat"
            onClick={handleResetChat}
          >
            <RefreshCw className="w-5" />
          </button>
        </div>
      </div>

      {/* Conditional Rendering Based on Active View */}
      {activeView === "Analyze" ? (
  <div id="message-container" className="flex-1 overflow-y-auto px-4 py-2">
    <MessageList messages={messages} isLoading={isLoading} />
  </div>
) : (
  <div className="flex-1 overflow-y-auto px-4 py-2">
    <NotesEditor />
  </div>
)}

      {/* Input Form */}
      {activeView === "Analyze" && (
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
      )}
    </div>
  );
};

export default ChatComponent;
