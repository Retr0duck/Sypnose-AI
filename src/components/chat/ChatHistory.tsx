
"use client";

import type { RefObject } from "react";
import React, { useEffect, useRef } from "react";
import type { Message } from "@/types";
import { ChatMessage } from "./ChatMessage";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatHistoryProps {
  messages: Message[];
  userAvatarUrl?: string | null;
  userName?: string | null;
  isLoadingAiResponse: boolean;
}

export function ChatHistory({ messages, userAvatarUrl, userName, isLoadingAiResponse }: ChatHistoryProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [messages, isLoadingAiResponse]);


  return (
    <ScrollArea className="flex-1 p-4" viewportRef={viewportRef}>
      <div className="max-w-3xl mx-auto space-y-1">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} userAvatarUrl={userAvatarUrl} userName={userName} />
        ))}
        {isLoadingAiResponse && (
          <div className="flex items-start gap-3 py-3 justify-start">
             <div className="h-8 w-8 rounded-full bg-muted animate-pulse"></div>
            <div className="max-w-[70%] rounded-lg p-3 shadow-md bg-card text-card-foreground rounded-bl-none">
              <div className="space-y-2">
                <div className="h-2 w-20 bg-muted-foreground/30 rounded animate-pulse"></div>
                <div className="h-2 w-12 bg-muted-foreground/30 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
