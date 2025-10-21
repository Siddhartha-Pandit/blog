"use client";

import React, { useEffect, useState } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { ChevronsLeftRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface User {
  fullName?: string;
  email?: string;
  imageUrl?: string;
}

const UserItem: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // ✅ Fetch current user from your backend
  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) throw new Error("Failed to fetch user"); // ✅ fix here
      const data = await res.json();
      setUser(data);
    } catch (err) {
      console.error(err);
      setUser(null);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const toggleDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setShowDetails((prev) => !prev);
  };

  // ✅ Logout via backend API
  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });
      if (!res.ok) throw new Error("Logout failed");
      toast.success("Logged out successfully!");
      router.push("/login");
    } catch (err) {
      console.error(err);
      toast.error("Failed to logout");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div
          role="button"
          className="flex items-center text-sm p-3 w-full hover:bg-primary/5"
        >
          <div className="flex items-center gap-x-2 max-w-[220px]">
            <Avatar className="h-5 w-5 flex-shrink-0">
              <AvatarImage src={user?.imageUrl ?? undefined} />
            </Avatar>

            <div className="flex items-center gap-x-1 min-w-0">
              <span className="text-start font-medium line-clamp-1 truncate">
                {user?.fullName ? `${user.fullName}'s Jotion` : "Your Jotion"}
              </span>

              <button
                type="button"
                onClick={toggleDetails}
                onMouseDown={(e) => e.preventDefault()}
                aria-expanded={showDetails}
                aria-label={showDetails ? "Hide details" : "Show details"}
                className="p-1 rounded-sm focus:outline-none"
              >
                <ChevronsLeftRight
                  className={`h-4 w-4 cursor-pointer transition-transform duration-300 ${
                    showDetails ? "rotate-180" : "rotate-90"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-80 bg-background rounded-md shadow-md border border-border"
        align="start"
        alignOffset={11}
        forceMount
      >
        <DropdownMenuItem
          asChild
          className="w-full cursor-pointer text-muted-foreground"
        >
          <div className="flex flex-col space-y-4 p-2 transition-all duration-300 animate-in fade-in slide-in-from-top-1">
            <p className="text-xs font-medium leading-none text-muted-foreground truncate">
              {user?.email ?? ""}
            </p>

            <div className="flex items-center gap-x-2">
              <div className="rounded-md bg-secondary p-1">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.imageUrl ?? undefined} />
                </Avatar>
              </div>

              <div className="space-y-1 min-w-0">
                <p className="text-sm line-clamp-1 truncate">
                  {user?.fullName ? `${user.fullName}'s Jotion` : "Your Jotion"}
                </p>
              </div>
            </div>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="w-full cursor-pointer text-muted-foreground"
          onClick={handleLogout}
        >
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserItem;
