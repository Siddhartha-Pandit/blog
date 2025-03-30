"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut, signIn } from "next-auth/react";
import ThemeToggle from "./ThemeToggle";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { ArrowUpToLine } from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function NavbarCreate() {
  const { data: session } = useSession();
  // Removed isSearchOpen and setIsSearchOpen because they weren't used.
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Simple email mask function
  function maskEmail(email: string) {
    if (!email || typeof email !== "string") return "";
    const [localPart, domain] = email.split("@");
    if (!localPart || !domain) return email;
    const firstTwo = localPart.slice(0, 2);
    const bulletMask = "•".repeat(10);
    return `${firstTwo}${bulletMask}@${domain}`;
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-4 h-[50px] bg-[var(--background)] text-[var(--foreground)] border-b border-[var(--border)]">
      <div className={`flex items-center space-x-4 ${isMobile ? "text-base" : "text-xl"}`}>
        <span className="font-poppins font-extrabold tracking-wide">
          <span className="text-[#004EBA] dark:text-[#79ACF2]">Today&apos;s</span>Words&apos;
        </span>
      </div>
      <div className={`flex items-center ${isMobile ? "space-x-2" : "space-x-4"}`}>
        <Link href="/create">
          <Button
            className={`flex items-center gap-2 rounded-full border border-gray-300 bg-[#004EBA] text-[#faf9f6] dark:text-[#1e1e1e] hover:bg-[#005CEB] ${
              isMobile ? "px-2 py-1 text-xs" : "px-4 py-2 text-sm font-medium"
            } shadow-sm transition-colors dark:border-neutral-600 dark:bg-[#79ACF2] dark:hover:bg-[#88B9F7]`}
          >
            <ArrowUpToLine size={isMobile ? 16 : 20} />
            {!isMobile && <span>Publish</span>}
          </Button>
        </Link>
        <ThemeToggle />
        {session ? (
          <Menubar className="bg-transparent border-none shadow-none">
            <MenubarMenu>
              <MenubarTrigger className="focus:outline-none">
                <Avatar className={`${isMobile ? "w-7 h-7" : "w-9 h-9"} border-0 !border-none !shadow-none !ring-0`}>
                  <AvatarImage
                    src={session.user?.image || ""}
                    alt={session.user?.name || "User"}
                    loading="lazy"
                  />
                  <AvatarFallback className="bg-gray-500 text-white">
                    {session.user?.name ? session.user.name.charAt(0).toUpperCase() : "U"}
                  </AvatarFallback>
                </Avatar>
              </MenubarTrigger>
              <MenubarContent
                align="end"
                className="w-[275px] rounded-md border border-[var(--border)] bg-[var(--popover)] text-[var(--popover-foreground)] shadow-md"
              >
                <MenubarItem className="px-3 py-2 hover:bg-[var(--muted)] cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Image
                      src={session?.user?.image ?? ""}
                      alt={session?.user?.name ?? "User"}
                      className="rounded-full object-cover"
                      width={32}
                      height={32}
                      priority
                      unoptimized
                    />
                    <div className="flex flex-col">
                      <span className="font-semibold text-[var(--foreground)]">
                        {session?.user?.name ?? "Guest"}
                      </span>
                      <span className="text-xs text-[var(--muted-foreground)]">
                        {maskEmail(session?.user?.email ?? "")}
                      </span>
                    </div>
                  </div>
                </MenubarItem>
                <MenubarSeparator className="my-1 border-t border-[var(--border)]" />
                <MenubarItem
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="cursor-pointer flex justify-between px-3 py-2 hover:bg-[var(--muted)]"
                >
                  Sign Out
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        ) : (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="border-0 transition-colors text-[14px] bg-[#faf9f6] text-[#1e1e1e] dark:bg-[#1e1e1e] dark:text-[#faf9f6] hover:bg-[#f0f0f0]">
                Sign In
              </Button>
            </DialogTrigger>
            <DialogContent className="w-full max-w-md rounded-lg bg-[#faf9f6] dark:bg-[#1e1e1e] p-6 shadow-lg">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-[#1e1e1e] dark:text-[#faf9f6]">
                  Login / Signup
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600 dark:text-gray-300">
                  Sign in with your Google account.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-6">
                <Button
                  onClick={() => signIn("google")}
                  className="w-full flex items-center justify-center px-4 py-2 rounded-md bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-colors duration-200 text-white font-semibold shadow-lg"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" />
                  </svg>
                  Continue with Google
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </nav>
  );
}
