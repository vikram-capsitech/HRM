"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChatMessage } from "./chat-message";
import { generateChatResponse } from "@/actions/gemini.action";
import { SiChatbot } from "react-icons/si";
import {
  MessageSquare,
  SendHorizontal,
  X,
  Sparkles,
  Loader2,
  Bot,
  Minimize2,
} from "lucide-react";

type Message = {
  role: "user" | "model";
  content: string;
  timestamp: string;
};

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      content:
        "Hi there! I'm your AI assistant for Hirely. How can I help you with our AI-powered interviewing platform today?",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: message,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);

    try {
      const chatHistory = messages.map(({ role, content }) => ({
        role,
        content,
      }));

      const response = await generateChatResponse(message, chatHistory);

      if (response.success && response.data) {
        const botMessage: Message = {
          role: "model",
          content: response.data,
          timestamp: new Date().toLocaleTimeString(),
        };

        setMessages((prev) => [...prev, botMessage]);
      } else {
        const errorMessage: Message = {
          role: "model",
          content: "Sorry, I couldn't process your request. Please try again.",
          timestamp: new Date().toLocaleTimeString(),
        };

        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("Error sending message:", error);

      const errorMessage: Message = {
        role: "model",
        content: "An error occurred. Please try again later.",
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          className="fixed bottom-6 right-6 z-50 h-16 w-16 rounded-full bgGrad ring ring-primary p-0 shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-primary/25 "
          aria-label="Open AI Assistant"
        >
          <SiChatbot className="h-12 w-12 text-white scale-150" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        side="top"
        align="end"
        className="p-0 min-w-[400px] border-muted"
        sideOffset={-80}
      >
        <Card className="border-0 p-0 bg-white dark:bg-slate-800 bg-gradient-to-b rounded-sm from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 overflow-hidden gap-0">
          {/* Header with gradient background */}
          <CardHeader className="bgGrad text-white p-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-lg font-bold">
                <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  Hirely Assistant
                </span>
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 rounded-full text-white/80 hover:text-white hover:bg-white/10"
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* Messages area with custom scrollbar */}
          <CardContent className="h-96 overflow-hidden border-muted overflow-y-auto p-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
            <div className="flex flex-col space-y-3">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className="animate-in text-sm slide-in-from-bottom-2 duration-300"
                >
                  <ChatMessage
                    message={msg.content}
                    isUser={msg.role === "user"}
                    timestamp={msg.timestamp}
                  />
                </div>
              ))}

              {/* Loading indicator with enhanced styling */}
              {isLoading && (
                <div className="flex w-full  justify-start animate-in slide-in-from-bottom-2 duration-300">
                  <div className="flex max-w-[80%] items-center gap-3 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 p-4 border border-blue-200/50 dark:border-blue-800/50">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        AI is thinking...
                      </span>
                      <div className="flex gap-1 mt-1">
                        <div className="h-1 w-1 rounded-full bg-primary animate-bounce" />
                        <div className="h-1 w-1 rounded-full bg-primary animate-bounce [animation-delay:0.1s]" />
                        <div className="h-1 w-1 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>

          {/* Enhanced input area */}
          <CardFooter className="p-4 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800 dark:to-gray-800 border-t border-gray-200/50 dark:border-gray-700/50">
            <form
              onSubmit={handleSendMessage}
              className="flex w-full items-center gap-3"
            >
              <div className="relative flex-1">
                <Input
                  placeholder="Ask me anything about Hirely..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="pr-12 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 shadow-sm"
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                size="icon"
                disabled={isLoading || !message.trim()}
                className="h-10 w-10 rounded-2xl bgGrad transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <SendHorizontal className="h-4 w-4" />
                )}
              </Button>
            </form>

            {/* Quick actions or status */}
          </CardFooter>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
