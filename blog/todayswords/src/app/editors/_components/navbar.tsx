"use client";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { MenuIcon } from "lucide-react";
import { Title } from "./title";
import { Banner } from "./banner";
import { Menu } from "./menu";
import { Pusblish } from "./publish";
interface NavbarProps {
  isCollapsed: boolean;
  onResetWidth: () => void;
}
export const Navbar = ({ isCollapsed, onResetWidth }: NavbarProps) => {
  const params = useParams();
  const removeIcon=useMutation(api.document.removeIcon)
  const document = useQuery(api.document.getById, {
    documentId: params.documentId as Id<"documents">,
  });
  if (document === undefined) {
   return(
    <nav className="bg-background dark:bg-[#1f1f1f] px-3 py-2 w-full flex items-center justify-between">
        <Title.Skeleton/>
        <div className="flex items-center gap-x-2">
            <Menu.SKeleton/>
        </div>
    </nav>
   )
  }
  if (document === null) {
   return null
  }
  return (
    <>
      <nav className="bg-background dark:bg-[#1f1f1f] px-3 py-2 w-full flex items-center gap-x-4">
        {isCollapsed && (
          <MenuIcon
            role="button"
            onClick={onResetWidth}
            className="h-6 w-6 text-muted-foreground"
          />
        )}
        <div className="flex items-center justify-between w-full">

        <Title initialData={document}/>
        <div className="flex items-center gap-x-2">
          <Pusblish initialData={document}/>
            <Menu documentId={document._id}>

            </Menu>
        </div>
        </div>
      </nav>
      {document.isArchived && (<Banner documentId={document._id}/>)}
    </>
  );
};
