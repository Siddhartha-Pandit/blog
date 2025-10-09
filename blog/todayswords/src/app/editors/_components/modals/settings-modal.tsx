"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useSettings } from "@/hooks/use-settings";
import { useTheme } from "next-themes"; // ✅ for theme switching
import { Button } from "@/components/ui/button"; // shadcn/ui button
import { Moon, Sun, Laptop } from "lucide-react"; // icons

export const SettingsModal = () => {
  const settings = useSettings();
  const { theme, setTheme } = useTheme();

  return (
    <Dialog open={settings.isOpen} onOpenChange={settings.onClose}>
      <DialogContent>
        {/* Accessible header */}
        <DialogHeader className="border-b pb-3">
          <DialogTitle className="text-lg font-medium">My Settings</DialogTitle>
          <DialogDescription>
            Manage your personal preferences and appearance.
          </DialogDescription>
        </DialogHeader>

        {/* Appearance section */}
        <div className="flex items-center justify-between py-4">
          <div className="flex flex-col gap-y-1">
            <Label>Appearance</Label>
            <span className="text-sm text-muted-foreground">
              Customize how Jotion looks on your device.
            </span>
          </div>

          {/* ✅ Theme toggle buttons */}
          <div className="flex items-center gap-x-2">
            <Button
              variant={theme === "light" ? "default" : "outline"}
              onClick={() => setTheme("light")}
            >
              <Sun className="h-4 w-4 mr-1" />
              Light
            </Button>
            <Button
              variant={theme === "dark" ? "default" : "outline"}
              onClick={() => setTheme("dark")}
            >
              <Moon className="h-4 w-4 mr-1" />
              Dark
            </Button>
            <Button
              variant={theme === "system" ? "default" : "outline"}
              onClick={() => setTheme("system")}
            >
              <Laptop className="h-4 w-4 mr-1" />
              System
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
