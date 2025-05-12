
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ChatHistory } from "./ChatHistory";
import { ChatInput } from "./ChatInput";
import { useAuth } from "@/contexts/auth-context";
import type { Message } from "@/types";
import { getChatHistory, saveUserMessage, sendMessageAndGetResponse } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";

export function ChatInterface() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const { toast } = useToast();

  const loadHistory = useCallback(async () => {
    if (user) {
      setIsLoadingHistory(true);
      try {
        const history = await getChatHistory(user.uid);
        setMessages(history);
      } catch (error) {
        console.error("Failed to load chat history:", error);
        toast({ title: "Error", description: "Could not load chat history.", variant: "destructive" });
      } finally {
        setIsLoadingHistory(false);
      }
    }
  }, [user, toast]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleSendMessage = async (text: string) => {
    if (!user) return;

    setIsSendingMessage(true);

    // Optimistically add user message to UI and save to DB
    const tempUserMessageId = `temp-user-${Date.now()}`;
    const localUserMessage: Message = {
      id: tempUserMessageId,
      text,
      sender: 'user',
      userId: user.uid,
      timestamp: new Date(), // Use local Date for optimistic update
    };
    setMessages(prev => [...prev, localUserMessage]);

    const savedUserMessage = await saveUserMessage(user.uid, text);
    if (savedUserMessage) {
      setMessages(prev => prev.map(msg => msg.id === tempUserMessageId ? savedUserMessage : msg));
    } else {
      // Rollback optimistic update or mark as failed
      setMessages(prev => prev.filter(msg => msg.id !== tempUserMessageId));
      toast({ title: "Error", description: "Failed to send your message.", variant: "destructive" });
      setIsSendingMessage(false);
      return;
    }
    
    // Get AI response
    const aiResponse = await sendMessageAndGetResponse(user.uid, text, messages);
    if (aiResponse) {
      setMessages(prev => [...prev, aiResponse]);
    } else {
      toast({ title: "Error", description: "AI failed to respond.", variant: "destructive" });
    }
    setIsSendingMessage(false);
  };

  if (isLoadingHistory && messages.length === 0) {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading chat history...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]"> {/* Adjust height considering header */}
      <ChatHistory 
        messages={messages} 
        userAvatarUrl={user?.photoURL} 
        userName={user?.displayName}
        isLoadingAiResponse={isSendingMessage && messages[messages.length -1]?.sender === 'user'}
      />
      <ChatInput onSendMessage={handleSendMessage} isLoading={isSendingMessage} />
    </div>
  );
}
