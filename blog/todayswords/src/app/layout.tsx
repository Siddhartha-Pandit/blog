import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "sonner";
import { ModalProvider } from "@/components/providers/modal-provider";

// ✅ Font setup
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ✅ Page metadata
export const metadata: Metadata = {
  title: "Today's Words",
  description: "A modern blogging application powered by Convex and Cloudinary.",
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

// ✅ Root layout
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
       
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            storageKey="jotion-theme"
          >
            {/* ✅ Toast notifications */}
            <Toaster position="bottom-right" />
            
            {/* ✅ Global modals */}
            <ModalProvider />
            
            {/* ✅ Page content */}
            {children}
          </ThemeProvider>
       
      </body>
    </html>
  );
}
