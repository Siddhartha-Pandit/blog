"use client";

import React from "react";
import { Providers } from "../providers";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/Navbar";


export default function CreateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <Navbar />
        {children}
      </ThemeProvider>
    </Providers>
  );
}
