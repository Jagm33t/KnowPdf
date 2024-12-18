import { cn } from "@/lib/utils";
import { Message } from "ai/react";
import { Loader2, Clipboard, Volume2, StopCircle } from "lucide-react"; // Importing stop icon
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Props = {
  isLoading: boolean;
  messages: Message[];
  onMessageContentAdd: (content: string) => void; 
};

const MessageList = ({ messages, isLoading, onMessageContentAdd }: Props) => {
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const speakContent = (content: string, messageId: string) => {
    const synth = window.speechSynthesis;

    if (speakingMessageId === messageId) {
      synth.cancel();
      setSpeakingMessageId(null);
    } else {
      const utterance = new SpeechSynthesisUtterance(content);
      synth.speak(utterance);
      setSpeakingMessageId(messageId);

      utterance.onend = () => {
        setSpeakingMessageId(null);
      };
    }
  };
  const handleAddMessageContent = (content: string) => {
    // Simply send the content to the parent
    onMessageContentAdd(content);
    console.log("adde",content)
  };

  const copyToClipboard = (content: string, messageId: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedMessageId(messageId);
      setTimeout(() => {
        setCopiedMessageId(null);
      }, 2000);
    });
  };

  return (
    <div className="flex flex-col mb-1 gap-4 px-4">
      {isLoading ? (
        <div className="flex items-center justify-center text-sm text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin" />
          <p className="ml-2">Loading...</p>
        </div>
      ) : null}

      {messages.map((message) => (
        <div key={message.id} className={cn("flex items-start", {
          "justify-end pl-10": message.role === "user",
          "justify-start pr-10": message.role === "system" || message.role === "assistant", // Apply the same styling for 'system' and 'assistant'
        })}>
          {/* Show avatar for 'system' and 'assistant' */}
          {(message.role === "system" || message.role === "assistant") && (
            <Avatar className="w-8 h-8 mt-1">
              <AvatarImage src="/chat-logo.png" className="object-cover" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          )}

          <div className={cn("rounded-lg px-3 text-sm py-1 mb-2", {
            "bg-[#f6f5f8] text-[#313336]": message.role === "user",
          })}>
            <p>{message.content}</p>

            {/* Show buttons for 'system' and 'assistant' roles */}
            {(message.role === "system" || message.role === "assistant") && (
              <div className="flex justify-end gap-2 mt-2 mb-2">
                <button onClick={() => copyToClipboard(message.content, message.id)} className="hover:text-[#33679c]" title="Copy to clipboard">
                  {copiedMessageId === message.id ? (
                    <span className="text-[#33679c] text-sm">Copied!</span>
                  ) : (
                    <Clipboard className="w-4 h-4" />
                  )}
                </button>
                <button onClick={() => speakContent(message.content, message.id)} className="hover:text-[#33679c]" title={speakingMessageId === message.id ? "Stop speaking" : "Speak content"}>
                  {speakingMessageId === message.id ? (
                    <StopCircle className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageList;
