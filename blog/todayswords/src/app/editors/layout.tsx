"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navigation from "./_components/navigation";
import { SearchCommand } from "@/components/search-command";
import { Spinner } from "@/components/spinner";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "sonner";
import { ModalProvider } from "@/components/providers/modal-provider";

// --- Helper to fetch session info from API ---
async function fetchSession() {
  try {
    const res = await fetch("/api/auth/session", { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user || null;
  } catch (err) {
    console.error("Failed to fetch session", err);
    return null;
  }
}

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSession().then((user) => {
      if (!user) {
        router.replace("/"); // redirect unauthenticated users
      } else {
        setUser(user);
        setLoading(false);
      }
    });
  }, [router]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <Toaster position="bottom-right" />
        <ModalProvider />
        <div className="h-full flex dark:bg-[#1f1f1f]">
          <Navigation />
          <main className="flex-1 h-full overflow-y-auto">
            <SearchCommand />
            {children}
          </main>
        </div>
      </ThemeProvider>
    </SessionProvider>
  );
};

export default MainLayout;
