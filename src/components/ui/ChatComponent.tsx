'use client';

import React from "react";
import { Input } from "./input";
import { useChat } from "ai/react";
import { Button } from "./button";
import { Send } from "lucide-react";
import MessageList from "./MessageList";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Message } from "ai";

interface Props {
  chatId: number;
}

const ChatComponent = ({ chatId }: Props) => {
  const { data, isLoading } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: async () => {
      const response = await axios.post<Message[]>("/api/get-messages", {
        chatId,
      });
      return response.data;
    },
  });

  const { input, handleInputChange, handleSubmit, messages } = useChat({
    api: "/api/chat",
    body: {
      chatId,
    },
    initialMessages: data || [],
  });

  React.useEffect(() => {
    const messageContainer = document.getElementById("message-container");
    if (messageContainer) {
      messageContainer.scrollTo({
        top: messageContainer.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 inset-x-0 p-2 bg-gray-50">
        <h3 className="text-xl">Chat</h3>
      </div>

      {/* Message List */}
      <div
        id="message-container"
        className="flex-1 overflow-y-auto px-4 py-2"
      >
        <MessageList messages={messages} isLoading={isLoading} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSubmit}
        className="w-full bg-gray-50 px-5 py-4 "
      >
        <div className="flex items-center ">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask any question..."
            className="w-full "
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
