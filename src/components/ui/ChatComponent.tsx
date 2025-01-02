'use client'

import React, { useEffect, useState } from "react";
import { DrizzleChat } from "@/lib/db/schema";
import { Input } from "./input";
import { useChat } from "ai/react";
import { Button } from "./button";
import { Send, Share, Download, RefreshCw } from "lucide-react"; 
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
  chatId: string;
  chats: DrizzleChat[];
  appendedMessage?: string[];
  isPro: boolean;
}

const ChatComponent = ({ chatId, chats, isPro }: Props) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [shareableLink, setShareableLink] = useState<string>("");
  const [activeView, setActiveView] = useState<"Analyze" | "Notes">("Analyze");
  const [loading, setLoading] = useState(false);
  const [appendedMessage, setAppendedMessage] = useState<string[]>([]); 

  
  const [inputDisabled, setInputDisabled] = useState<boolean>(false);

  const handleSetLoading = (isLoading: boolean) => {
    setLoading(isLoading);
    // console.log("loading ",loading)
  };

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
    // console.log("Updated messages:", messages);
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

  const handleMessageContentAdd = (messageContent: string) => {
    // Append the new message content to the previous state (messages)
    setAppendedMessage((prevMessages) => [...prevMessages, messageContent]);
  };

  useEffect(() => {
    if (!isPro && messages.length >= 20) {
      setInputDisabled(true);  // Disable input after 2 messages if not Pro
    } else {
      setInputDisabled(false); // Enable input if Pro or less than 2 messages
    }
  }, [isPro, messages.length]);

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();  // Prevent default form submission

    // Allow submission only if input is enabled
    if (inputDisabled) {
      toast.error("Message limit reached. Please subscribe to Pro for more messages.");
      return;
    }
    
    // Proceed with submitting the message if input is enabled
    handleSubmit(e);
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
            disabled={!isPro} 
          >
            <RefreshCw className="w-5" />
          </button>
        </div>
      </div>
      {activeView === "Notes" && (
        <div className="flex justify-end pr-4">
          {loading ? (
            <div className="text-xs text-gray-500 py-1 pr-4 ">Saving...</div>
          ) : (
            <div className="text-xs text-[#33679c] px-1 pr-4 ">Saved !</div>
          )}
        </div>
      )}
      {/* Conditional Rendering Based on Active View */}
      {activeView === "Analyze" ? (
        <div id="message-container" className="flex-1 overflow-y-auto px-4 py-2">
          <MessageList onMessageContentAdd={handleMessageContentAdd }  messages={messages}  isLoading={isLoading} />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 py-2">
          {/* Pass chatId to NotesEditor */}
          <NotesEditor appendedMessage={appendedMessage} isPro={isPro} chats={chats} chatId={chatId} setLoadingState={handleSetLoading} />
        </div>
      )}
  
      {activeView === "Analyze" && (
        <div>
          {/* Predefined Buttons */}
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
          <form onSubmit={handleInputSubmit} className="w-full bg-white px-5 py-4">
            <div className="flex items-center">
              {inputDisabled ? (
                <div className="text-sm text-red-500">You need to subscribe to Pro to send more messages.</div>
              ) : (
                <>
                  <Input value={input} onChange={handleInputChange} placeholder="Ask any question..." className="w-full" maxLength={800} disabled={inputDisabled} />
                  <Button type="submit" className="bg-[#192c56] ml-2" disabled={inputDisabled}>
                    <Send className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
  
};

export default ChatComponent;
