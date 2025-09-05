"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { ChatbotDialog } from "@/components/smart-report-dialog";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Logo } from "./logo";
import * as React from "react";
import type { Position } from "@/types";

interface HeaderProps {
  isChatbotOpen: boolean;
  onChatbotOpenChange: (open: boolean) => void;
  userPosition: Position | null;
}

export function Header({ isChatbotOpen, onChatbotOpenChange, userPosition }: HeaderProps) {
  const isMobile = useIsMobile();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background/80 backdrop-blur-sm px-4 md:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        {isMobile && <Logo isMobile={true} />}
      </div>
      
      <ChatbotDialog open={isChatbotOpen} onOpenChange={onChatbotOpenChange} userPosition={userPosition}>
        <Button variant="outline" className="bg-transparent">
          <MessageCircle className="mr-2 h-4 w-4" />
          Chatbot
        </Button>
      </ChatbotDialog>
    </header>
  );
}
