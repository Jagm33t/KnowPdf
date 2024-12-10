import { cn } from "@/lib/utils";
import { Message } from "ai/react";
import { Loader2, Clipboard, Volume2, StopCircle } from "lucide-react"; // Importing stop icon
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Props = {
  isLoading: boolean;
  messages: Message[];
};

const MessageList = ({ messages, isLoading }: Props) => {
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const speakContent = (content: string, messageId: string) => {
    const synth = window.speechSynthesis;

    if (speakingMessageId === messageId) {
      // Stop speaking if the same message is clicked again
      synth.cancel();
      setSpeakingMessageId(null);
    } else {
      const utterance = new SpeechSynthesisUtterance(content);
      synth.speak(utterance);
      setSpeakingMessageId(messageId);

      // Listen for when speaking ends
      utterance.onend = () => {
        setSpeakingMessageId(null);
      };
    }
  };

  const copyToClipboard = (content: string, messageId: string) => {
    navigator.clipboard.writeText(content).then(() => {
      // Show "Copied" text for 2 seconds
      setCopiedMessageId(messageId);
      setTimeout(() => {
        setCopiedMessageId(null);
      }, 2000);
    });
  };

  if (isLoading) {
    return (
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (!messages) return <></>;

  return (
    <div className="flex flex-col mb-1 gap-4 px-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn("flex items-start", {
            "justify-end pl-10": message.role === "user",
            "justify-start pr-10": message.role === "system",
          })}
        >
          {message.role === "system" && (
            <>
              <Avatar className="w-8 h-8 mt-1">
                <AvatarImage src="/chat-logo.png" className="object-cover" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </>
          )}
          <div
            className={cn(
              "rounded-lg px-3 text-sm py-1 mb-2",
              {
                "bg-[#f6f5f8] text-[#313336]": message.role === "user",
              }
            )}
          >
            <p>{message.content}</p>
            {message.role === "system" && (
              <div className="flex justify-end gap-2 mt-2 mb-2">
                {/* Copy Icon */}
                <button
                  onClick={() => copyToClipboard(message.content, message.id)}
                  className="hover:text-[#33679c]"
                  title="Copy to clipboard"
                >
                  {copiedMessageId === message.id ? (
                    <span className="text-[#33679c] text-sm">Copied!</span>
                  ) : (
                    <Clipboard className="w-4 h-4" />
                  )}
                </button>
                {/* Speak/Stop Icon */}
                <button
                  onClick={() => speakContent(message.content, message.id)}
                  className="hover:text-[#33679c]"
                  title={speakingMessageId === message.id ? "Stop speaking" : "Speak content"}
                >
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
