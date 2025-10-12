"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import Logo from "./logo";
import { ModeToggle } from "@/components/mode-toggle";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Spinner } from "./spinner";

const Navbar = () => {
  const { data: session, status } = useSession(); // NextAuth session
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll to add shadow/border
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isLoading = status === "loading";
  const isSignedIn = !!session?.user;

  return (
    <div
      className={cn(
        "z-50 bg-white dark:bg-[#1f1f1f] fixed top-0 flex items-center w-full fp-6 transition-shadow",
        scrolled && "border-b shadow-sm"
      )}
    >
      <Logo />
      <div className="md:ml-auto md:justify-end justify-between w-full flex items-center gap-x-2">
        {isLoading && <Spinner size="sm" />}

        {!isLoading && !isSignedIn && (
          <>
            <Button variant="ghost" size="sm" onClick={() => signIn("google")}>
              Log in
            </Button>
            <Button variant="ghost" size="sm" onClick={() => signIn("google")}>
              Get Jotion free
            </Button>
          </>
        )}

        {!isLoading && isSignedIn && session.user && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => (window.location.href = "/document")}
            >
              Enter Jotion
            </Button>
            <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
              Sign out
            </Button>
          </>
        )}

        <ModeToggle />
      </div>
    </div>
  );
};

export default Navbar;
