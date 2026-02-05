import React from "react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { MessageSquare, Bot } from "lucide-react";
import Markdown from 'react-markdown'

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp?: string;
}

export function ChatMessage({ message, isUser }: ChatMessageProps) {
  return (
    <div
      className={cn(
        "flex w-full gap-1 p-2",
        isUser ? "justify-end" : "justify-start"
      )}
    >
     
      <div
        className={cn(
          "flex max-w-[80%] flex-col gap-2 rounded-[14px] p-2 px-4",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted/50"
        )}
      >
        <div className={` ${isUser ? "text-white" : "text-black"} prose text-sm max-w-full`}>
          <Markdown>{message}</Markdown>
        </div>
       
      </div>
     
    </div>
  );
}
