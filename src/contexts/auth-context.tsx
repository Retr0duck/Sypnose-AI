"use client";

import type { ReactNode } from "react";
import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import { 
  onAuthStateChanged, 
  signOut as firebaseSignOut, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  type User as FirebaseUser // Renamed to avoid conflict
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import type { UserProfile } from "@/types";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isEmailVerified: boolean;
  signUpWithEmail: (email: string, password: string) => Promise<boolean>;
  signInWithEmail: (email: string, password: string) => Promise<boolean>;
  sendVerificationEmail: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser as UserProfile);
        setIsEmailVerified(firebaseUser.emailVerified);
      } else {
        setUser(null);
        setIsEmailVerified(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUpWithEmail = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
        await sendEmailVerification(userCredential.user);
        toast({
          title: "Account Created",
          description: "A verification email has been sent. Please check your inbox.",
        });
        // User will be set by onAuthStateChanged
        return true;
      }
      return false;
    } catch (error: any) {
      console.error("Error signing up: ", error);
      toast({
        title: "Sign Up Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // User state and email verification status will be updated by onAuthStateChanged
      return true;
    } catch (error: any) {
      console.error("Error signing in: ", error);
      toast({
        title: "Sign In Failed",
        description: error.message || "Invalid email or password.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  const sendVerificationEmail = useCallback(async () => {
    if (auth.currentUser) {
      setLoading(true);
      try {
        await sendEmailVerification(auth.currentUser);
        toast({
          title: "Verification Email Sent",
          description: "Please check your inbox to verify your email address.",
        });
      } catch (error: any) {
        console.error("Error sending verification email: ", error);
        toast({
          title: "Error",
          description: "Could not send verification email. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
  }, [toast]);


  const signOut = async () => {
    try {
      setLoading(true);
      await firebaseSignOut(auth);
      router.push('/'); 
    } catch (error) {
      console.error("Error signing out: ", error);
      toast({
        title: "Sign Out Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AuthContext.Provider value={{ user, loading, isEmailVerified, signUpWithEmail, signInWithEmail, sendVerificationEmail, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
