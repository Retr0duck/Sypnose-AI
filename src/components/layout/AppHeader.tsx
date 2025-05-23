
"use client";

import Link from "next/link";
import { MessageCircle, LogOut, User as UserIcon } from "lucide-react"; // Added UserIcon
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AppHeader() {
  const { user, signOut, loading } = useAuth();

  const getDisplayName = () => {
    if (!user) return "U";
    if (user.isAnonymous) return "Guest";
    return user.displayName || user.email?.charAt(0).toUpperCase() || "U";
  };

  const getDisplayEmail = () => {
    if (!user) return "";
    if (user.isAnonymous) return "Anonymous User";
    return user.email || "";
  };

  const getAvatarFallback = () => {
    if (!user) return "U";
    if (user.isAnonymous) return <UserIcon className="h-5 w-5" />;
    return user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || "U";
  };


  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <MessageCircle className="h-6 w-6 text-accent" />
          <span className="font-bold sm:inline-block bg-gradient-to-r from-teal-600 via-blue-600 to-indigo-600 dark:from-purple-400 dark:via-pink-500 dark:to-red-500 bg-clip-text text-transparent">
            Synapse AI
          </span>
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <ThemeToggle />
          {loading ? (
             <div className="h-8 w-8 rounded-full bg-muted animate-pulse"></div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    {!user.isAnonymous && <AvatarImage src={user.photoURL || undefined} alt={getDisplayName()} />}
                    <AvatarFallback>{getAvatarFallback()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{getDisplayName()}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {getDisplayEmail()}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
             // This case should ideally not be reached if loading is false and user is null
             // because the page would redirect to auth forms.
             // However, as a fallback:
            <span className="text-sm text-muted-foreground">Not logged in</span>
          )}
        </div>
      </div>
    </header>
  );
}

    