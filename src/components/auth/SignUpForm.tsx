"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/contexts/auth-context";
import { Loader2 } from "lucide-react";

const signUpSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

interface SignUpFormProps {
  onSwitchToSignIn: () => void;
  onSignUpSuccess: () => void;
}

export function SignUpForm({ onSwitchToSignIn, onSignUpSuccess }: SignUpFormProps) {
  const { signUpWithEmail, loading } = useAuth();
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: SignUpFormValues) {
    const success = await signUpWithEmail(values.email, values.password);
    if (success) {
      onSignUpSuccess(); // Notify parent to switch view to verification prompt
    }
  }

  return (
    <div className="mx-auto w-full max-w-sm p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="you@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={loading}>
             {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Sign Up
          </Button>
        </form>
      </Form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Button variant="link" onClick={onSwitchToSignIn} className="p-0 h-auto font-semibold text-accent">
          Sign In
        </Button>
      </p>
    </div>
  );
}