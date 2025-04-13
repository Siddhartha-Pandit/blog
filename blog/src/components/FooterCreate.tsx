"use client";
import React  from 'react'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from 'react';
import { useSession } from "next-auth/react";

function FooterCreate() {
const [words] = useState(0);
  const [savedTime] = useState("1 min ago");
  const { data: session } = useSession();

  return (
    <div className="fixed bottom-0 left-0 right-0 h-7 bg-gray-800 text-white flex items-center justify-between px-4 text-xs z-50">
        <span>Saved: {savedTime}</span>
        <div className="flex flex-row items-center space-x-1">
          <span className="text-xs text-gray-200">Authors:</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Avatar className="w-4 h-4 border-0 !shadow-none">
                  {session?.user?.image ? (
                    <AvatarImage
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      loading="lazy"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <AvatarFallback className="bg-gray-500 dark:bg-gray-700 text-white dark:text-gray-200">
                      {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "U"}
                    </AvatarFallback>
                  )}
                </Avatar>
              </TooltipTrigger>
              <TooltipContent className="bg-[#e6e9ea] dark:bg-[#2e2e2e]">
                <p className="text-xs text-[#1e1e1e] dark:text-[#f6f9fa]">
                  {session?.user?.name || "Guest"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <span>{words} words</span>
      </div>
  )
}

export default FooterCreate