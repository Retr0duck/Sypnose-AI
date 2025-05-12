
"use client";

import { AppHeader } from "@/components/layout/AppHeader";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react"; // Using Loader2 as a spinner
import Image from "next/image";

export default function Home() {
  const { user, loading, signInWithGoogle } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-accent" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-1 flex flex-col">
        {user ? (
          <ChatInterface />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-teal-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Synapse AI
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-md">
              Sign in to start chatting with our intelligent AI. Your conversations are saved securely.
            </p>
            <Button onClick={signInWithGoogle} size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              Sign In with Google
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
