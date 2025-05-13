
import type { Message } from "@/types";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Bot } from "lucide-react";
import { useAuth } from "@/contexts/auth-context"; // Import useAuth

interface ChatMessageProps {
  message: Message;
  userAvatarUrl?: string | null; // Can be kept for non-anonymous users
  userName?: string | null; // Can be kept for non-anonymous users
}

export function ChatMessage({ message, userAvatarUrl, userName }: ChatMessageProps) {
  const { user: currentUser } = useAuth(); // Get current authenticated user
  const isUserMessage = message.sender === 'user';
  
  let displayUserName = userName;
  let displayAvatarUrl = userAvatarUrl;
  let displayInitials = userName ? userName.charAt(0).toUpperCase() : "U";

  if (isUserMessage && currentUser?.isAnonymous) {
    displayUserName = "Guest";
    displayAvatarUrl = undefined; // Anonymous users don't have photoURL
    displayInitials = "G";
  } else if (isUserMessage && !currentUser?.isAnonymous) {
    // Use provided props or fallback to current user's info
    displayUserName = userName || currentUser?.displayName || "User";
    displayAvatarUrl = userAvatarUrl || currentUser?.photoURL;
    displayInitials = displayUserName?.charAt(0).toUpperCase() || "U";
  }


  return (
    <div className={cn("flex items-start gap-3 py-3", isUserMessage ? "justify-end" : "justify-start")}>
      {!isUserMessage && (
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-accent text-accent-foreground">
            <Bot className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "max-w-[70%] rounded-lg p-3 shadow-md",
          isUserMessage ? "bg-accent text-accent-foreground rounded-br-none" : "bg-card text-card-foreground rounded-bl-none"
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
      </div>
      {isUserMessage && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={displayAvatarUrl || undefined} alt={displayUserName || "User"} />
          <AvatarFallback>{currentUser?.isAnonymous ? <User className="h-5 w-5"/> : displayInitials}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

    