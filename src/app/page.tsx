
"use client";

import React, { useState } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Loader2, MailCheck, AlertTriangle } from "lucide-react";
import { SignInForm } from "@/components/auth/SignInForm";
import { SignUpForm } from "@/components/auth/SignUpForm";

type AuthView = "signIn" | "signUp" | "verifyEmail";

export default function Home() {
  const { user, loading, isEmailVerified, sendVerificationEmail, signOut } = useAuth();
  const [authView, setAuthView] = useState<AuthView>("signIn");

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

  const renderAuthContent = () => {
    if (!user) {
      if (authView === "signIn") {
        return <SignInForm onSwitchToSignUp={() => setAuthView("signUp")} />;
      }
      if (authView === "signUp") {
        return <SignUpForm onSwitchToSignIn={() => setAuthView("signIn")} onSignUpSuccess={() => setAuthView("verifyEmail")} />;
      }
      // This case should ideally not be reached if !user, but as a fallback:
      return <SignInForm onSwitchToSignUp={() => setAuthView("signUp")} />;
    }

    // User is signed in
    // Show verification prompt only if user is not anonymous AND email is not verified
    if (user && !user.isAnonymous && (!isEmailVerified || authView === 'verifyEmail')) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <MailCheck className="h-16 w-16 text-accent mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Verify Your Email</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            A verification link has been sent to <strong>{user.email}</strong>.
            Please check your inbox (and spam folder) to complete your registration.
          </p>
          <Button onClick={sendVerificationEmail} disabled={loading} className="mb-4">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Resend Verification Email
          </Button>
           <Button variant="outline" onClick={signOut} disabled={loading}>
            Sign Out
          </Button>
          <p className="text-xs text-muted-foreground mt-4">
            If you&apos;ve already verified, try refreshing the page or signing out and back in.
          </p>
        </div>
      );
    }

    // User is signed in and (email is verified OR user is anonymous)
    return <ChatInterface />;
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-1 flex flex-col">
        {/* Show ChatInterface if user exists AND (user is anonymous OR email is verified) */}
        {user && (user.isAnonymous || isEmailVerified) ? (
          <ChatInterface />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center">
             {/* Show titles only if not in verification view and no user (pre-auth screens) */}
            { authView !== 'verifyEmail' && !user && (
              <>
                <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-teal-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Synapse AI
                </h1>
                <p className="text-lg text-muted-foreground mb-8 max-w-md text-center">
                  {authView === "signIn" 
                    ? "Sign in to continue your conversations." 
                    : "Create an account to start chatting with our AI."}
                </p>
              </>
            )}
            {renderAuthContent()}
          </div>
        )}
      </main>
    </div>
  );
}

    