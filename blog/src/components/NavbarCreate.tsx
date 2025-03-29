"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
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

export default function NavbarCreate() {
  const { data: session, status } = useSession();
  const [isMobile, setIsMobile] = useState(false);

  // Function to mask email addresses
  function maskEmail(email: string) {
    if (!email || typeof email !== "string") return "";
    const [localPart, domain] = email.split("@");
    if (!localPart || !domain) return email;
    const firstTwo = localPart.slice(0, 2);
    const bulletMask = "•".repeat(10);
    return `${firstTwo}${bulletMask}@${domain}`;
  }

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (status === "loading") {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-4 h-[50px] bg-gray-100">
        Loading...
      </nav>
    );
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-4 h-[50px] bg-[var(--background)] text-[var(--foreground)] border-b">
      <div suppressHydrationWarning className="flex items-center">
        <span
          className={`font-poppins font-extrabold tracking-wide ${
            isMobile ? "text-base" : "text-xl"
          }`}
        >
          <span className="text-[#004EBA] dark:text-[#79ACF2]">Today&apos;s</span>Words&apos;
        </span>
      </div>
      <div className={`flex items-center ${isMobile ? "space-x-2" : "space-x-4"}`}>
        <Button
          className="flex items-center gap-2 rounded-full px-5 py-2 bg-[#004EBA] text-[#FAF9F6] dark:bg-[#79ACF2] dark:text-[#000000] hover:bg-[#003F8F] transition-all shadow-md"
        >
          <ArrowUpToLine size={20} />
          {!isMobile && <span>Publish</span>}
        </Button>
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
          <Link
            href="/login"
            className="border-0 text-[var(--primary)] text-[14px] transition-colors hover:brightness-60"
          >
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}
