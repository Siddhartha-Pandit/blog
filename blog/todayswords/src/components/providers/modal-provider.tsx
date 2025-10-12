"use client";

import { SettingsModal } from "@/app/editors/_components/modals/settings-modal";
import { useEffect, useState } from "react";
import { CoverImageModal } from "@/app/editors/_components/modals/cover-image-modal";
export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  if (!isMounted) {
    return null;
  }
if(!isMounted){
    return null;
}
  return (
    <>
     <SettingsModal/>
     <CoverImageModal/>
    </>
  );
};
