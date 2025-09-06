"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Logo } from "./logo";
import * as React from "react";

interface HeaderProps {
  onChatbotOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Header({ onChatbotOpenChange, children }: HeaderProps) {
  const isMobile = useIsMobile();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background/80 backdrop-blur-sm px-4 md:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        {isMobile && <Logo isMobile={true} />}
      </div>
      
      {children}
    </header>
  );
}
