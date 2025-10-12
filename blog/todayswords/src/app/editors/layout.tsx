import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "sonner";
import { ModalProvider } from "@/components/providers/modal-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Today's Words'",
  description: "The blogging application.",
  icons: {
    icon: [
      {
        media: "(prefers-color-scheme:light)",
        url: "/logo.webp",
        href: "/logo.webp",
      },
      {
        media: "(prefers-color-scheme:dark)",
        url: "/logo.webp",
        href: "/logo.webp",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Theme, modal, and toaster providers */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="jotion-theme"
        >
          <Toaster position="bottom-right" />
          <ModalProvider />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
