// blog/app/(main)/_components/navigation.tsx
"use client";

import {
  ChevronsLeft,
  MenuIcon,
  Plus,
  PlusCircle,
  Search,
  Settings,
  Trash,
} from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useMediaQuery } from "usehooks-ts";
import { cn } from "@/lib/utils";
import { useParams, usePathname, useRouter } from "next/navigation";
import UserItem from "./useritem";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Item from "./item";
import { toast } from "sonner";
import DocumentList from "./document-list";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { TrashBox } from "./trash-box";
import { useSearch } from "@/hooks/use-search";
import { useSettings } from "@/hooks/use-settings";
import { Navbar } from "./navbar";

const Navigation = () => {
  const pathname = usePathname();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const search = useSearch();
  const settings = useSettings();
  const sidebarRef = useRef<HTMLElement>(null);
  const navbarRef = useRef<HTMLDivElement>(null);
  const isResizingRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);
  const create = useMutation(api.document.create);
  const params = useParams();

  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
const router=useRouter()
  // Responsive behavior
  useEffect(() => {
    if (isMobile) {
      setIsCollapsed(true);
    } else {
      setIsCollapsed(false);
      resetWidth();
    }
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) setIsCollapsed(true);
  }, [pathname, isMobile]);

  // Resize handlers
  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    isResizingRef.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizingRef.current || isMobile) return;
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);

    animationFrameRef.current = requestAnimationFrame(() => {
      let newWidth = e.clientX;
      if (newWidth < 200) newWidth = 200;
      if (newWidth > 480) newWidth = 480;
      setSidebarWidth(newWidth);
    });
  };

  const handleMouseUp = () => {
    isResizingRef.current = false;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const resetWidth = () => {
    if (!sidebarRef.current || !navbarRef.current) return;
    setIsCollapsed(false);
    setIsResetting(true);

    sidebarRef.current.style.width = isMobile ? "100%" : "240px";
    navbarRef.current.style.setProperty(
      "width",
      isMobile ? "0" : "calc(100% - 240px)"
    );
    navbarRef.current.style.setProperty("left", isMobile ? "100%" : "240px");

    setTimeout(() => setIsResetting(false), 300);
    setSidebarWidth(240);
  };

  const toggleCollapse = () => {
    if (!sidebarRef.current || !navbarRef.current) return;
    setIsResetting(true);

    if (isCollapsed) {
      setIsCollapsed(false);
      sidebarRef.current.style.width = isMobile ? "100%" : `${sidebarWidth}px`;
      navbarRef.current.style.setProperty(
        "width",
        isMobile ? "0" : `calc(100% - ${sidebarWidth}px)`
      );
      navbarRef.current.style.setProperty("left", isMobile ? "100%" : `${sidebarWidth}px`);
    } else {
      setIsCollapsed(true);
      sidebarRef.current.style.width = "0px";
      navbarRef.current.style.setProperty("width", "100%");
      navbarRef.current.style.setProperty("left", "0");
    }

    setTimeout(() => setIsResetting(false), 300);
  };

  const handleCreate = () => {
    const promise = create({ title: "Untitled" })
    .then((documentId=>router.push(`/documents/${documentId}`)))
    toast.promise(promise, {
      loading: "Creating a new note...",
      success: "New note created!",
      error: "Failed to create a new note.",
    });
  };

  return (
    <>
      <aside
        ref={sidebarRef}
        style={{
          width: isMobile
            ? isCollapsed
              ? 0
              : "100%"
            : isCollapsed
            ? 0
            : sidebarWidth,
          transition:
            isResizingRef.current || isResetting ? "none" : "width 0.25s ease",
        }}
        className={cn(
          "group/sidebar h-full bg-secondary overflow-y-auto relative flex flex-col z-[99999]"
        )}
      >
        <div
          role="button"
          onClick={toggleCollapse}
          className={cn(
            "h-6 w-6 text-muted-foreground rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600 absolute top-3 right-2 transition flex items-center justify-center",
            isMobile ? "opacity-100" : "opacity-0 group-hover/sidebar:opacity-100"
          )}
        >
          <ChevronsLeft
            className={cn("h-6 w-6 transition-transform duration-300", {
              "rotate-180": isCollapsed,
            })}
          />
        </div>

        <div className="pt-10">
          <UserItem />
          <Item label="Search" icon={Search} isSearch onClick={search.onOpen} />
          <Item label="Settings" icon={Settings} onClick={settings.onOpen} />
          <Item onClick={handleCreate} label="New Page" icon={PlusCircle} />
        </div>

        <div className="mt-4">
          <DocumentList />
          <Item onClick={handleCreate} icon={Plus} label="Add a page" />
          <Popover>
            <PopoverTrigger className="w-full mt-4">
              <Item label="Trash" icon={Trash} />
            </PopoverTrigger>
            <PopoverContent side={isMobile ? "bottom" : "right"} className="p-0 w-72">
              <TrashBox />
            </PopoverContent>
          </Popover>
        </div>

        {!isMobile && !isCollapsed && (
          <div
            onMouseDown={handleMouseDown}
            onDoubleClick={resetWidth}
            className="opacity-50 hover:opacity-100 transition cursor-ew-resize absolute h-full w-1 bg-primary/10 right-0 top-0"
            title="Drag to resize or double-click to reset"
          />
        )}
      </aside>

      <div
        ref={navbarRef}
        style={{
          left: isMobile
            ? isCollapsed
              ? "0"
              : "100%"
            : isCollapsed
            ? "0"
            : `${sidebarWidth}px`,
          width: isMobile
            ? isCollapsed
              ? "100%"
              : "0"
            : `calc(100% - ${isCollapsed ? 0 : sidebarWidth}px)`,
          transition: isResetting ? "none" : "all 0.25s ease",
        }}
        className="absolute top-0 z-[99999]"
      >
        {/* Render Navbar if there's a documentId in the route.
            Navbar is responsible for fetching it and showing appropriate fallbacks. */}
        {params?.documentId ? (
          <Navbar isCollapsed={isCollapsed} onResetWidth={resetWidth} key={params.documentId as string}/>
        ) : (
          <nav className="bg-transparent px-3 py-2 w-full flex items-center">
            {isCollapsed && (
              <MenuIcon
                onClick={toggleCollapse}
                role="button"
                className="h-6 w-6 text-muted-foreground cursor-pointer"
              />
            )}
          </nav>
        )}
      </div>
    </>
  );
};

export default Navigation;
