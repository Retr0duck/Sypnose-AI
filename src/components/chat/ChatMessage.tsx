
import type { Message } from "@/types";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Bot } from "lucide-react";

interface ChatMessageProps {
  message: Message;
  userAvatarUrl?: string | null;
  userName?: string | null;
}

export function ChatMessage({ message, userAvatarUrl, userName }: ChatMessageProps) {
  const isUser = message.sender === 'user';
  const initials = userName ? userName.charAt(0).toUpperCase() : "U";

  return (
    <div className={cn("flex items-start gap-3 py-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-accent text-accent-foreground">
            <Bot className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "max-w-[70%] rounded-lg p-3 shadow-md",
          isUser ? "bg-accent text-accent-foreground rounded-br-none" : "bg-card text-card-foreground rounded-bl-none"
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
      </div>
      {isUser && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={userAvatarUrl || undefined} alt={userName || "User"} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
